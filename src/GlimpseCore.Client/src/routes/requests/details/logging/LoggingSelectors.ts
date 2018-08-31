import * as Glimpse from '@glimpse/glimpse-definitions';
import sortBy from 'lodash/sortBy';
import { createSelector } from 'reselect';

import { AgentType } from '../timeline/TimelineInterfaces';
import { IMessage } from '@modules/messages/schemas/IMessage';
import { IStoreState } from '@client/IStoreState';
import {
    ILoggingMessage,
    ILoggingMessagePayloads,
    LoggingMessageLevel,
    ILoggingAgentSummary,
    ILoggingLevelSummary,
    ILoggingLevelCount,
    ILoggingAgentCount,
    ILoggingExploredCategories
} from './LoggingInterfaces';

import { selectedCategoryInitialState } from './LoggingReducers';
import { getNamesForEnum } from '@common/util/CommonUtilities';
import { getMessageByType } from '@routes/requests/RequestsSelector';
import { getSelectedContext } from '../RequestsDetailsSelector';
import { getServerOffsetFactor } from '../request/RequestSelectors';
import {
    getExpansionState,
    isExpanded
} from '@routes/requests/components/expansion/ExpansionSelectors';

//
// ROOT RECORDS SELECTORS
//

export const getLoggingMessages = (function() {
    function isGroupMessage(message) {
        return (
            message.types.indexOf(Glimpse.Messages.Payloads.Log.GroupBeginType) !== -1 ||
            message.types.indexOf(Glimpse.Messages.Payloads.Log.GroupEndType) !== -1
        );
    }

    function normalizeAgent(val: string): AgentType {
        let t = AgentType.Other;
        if (val === 'server') {
            t = AgentType.Server;
        } else if (val === 'browser') {
            t = AgentType.Browser;
        }
        return t;
    }

    function normalizeLevel(level: string): LoggingMessageLevel {
        if (level === undefined) {
            return undefined;
        }

        switch (level.toLowerCase()) {
            case 'critical':
            case 'fatal':
            case 'error':
                return LoggingMessageLevel.Error;
            case 'warn':
            case 'warning':
                return LoggingMessageLevel.Warning;
            case 'information':
            case 'info':
                return LoggingMessageLevel.Info;
            case 'log':
                return LoggingMessageLevel.Log;
            case 'verbose':
            case 'trace':
            case 'silly':
            case 'debug':
                return LoggingMessageLevel.Debug;
            default:
                return LoggingMessageLevel.Log;
        }
    }

    function cloneGroupFrame(groupingStack) {
        return groupingStack.map(frame => Object.assign({}, frame));
    }

    function getMessagesByType(messages, type) {
        return messages.filter(message => message.types.indexOf(type) > -1);
    }

    function buildMessageModels(
        rawMessages: IMessage<ILoggingMessagePayloads>[],
        offsetFactor: number
    ) {
        let currentOrdinal = 1;

        const allMessages = sortBy(rawMessages, [
            message => message.offset,
            message => message.ordinal
        ]).map((message, index) => {
            let ordinal;
            if (message.types.indexOf(Glimpse.Messages.Payloads.Log.GroupEndType) === -1) {
                ordinal = currentOrdinal++;
            }
            const agent = isGroupMessage(message)
                ? AgentType.Other
                : normalizeAgent(message.agent.source);
            const record: ILoggingMessage = {
                contextId: message.context.id,
                messageId: message.id,
                index: index + 1,
                ordinal,
                types: message.types,
                offset: (agent === AgentType.Server ? offsetFactor : 0) + message.offset,
                agent: agent,
                payload: message.payload,
                level: normalizeLevel(message.payload.level)
            };

            return record;
        });

        return allMessages;
    }

    function matchCorrelatedMessage(messages) {
        const correlationMessages = getMessagesByType(
            messages,
            Glimpse.Messages.Payloads.Mixin.CorrelationType
        );
        const begins = getMessagesByType(
            correlationMessages,
            Glimpse.Messages.Payloads.Mixin.CorrelationBeginType
        );
        const ends = getMessagesByType(
            correlationMessages,
            Glimpse.Messages.Payloads.Mixin.CorrelationEndType
        );

        const beginsByContext = begins.reduce((result, message) => {
            result[message.payload.correlationId] = message;
            return result;
        }, {});

        const endsByContext = ends.reduce((result, message) => {
            let correlatedEnds = result[message.payload.correlationId];

            if (!correlatedEnds) {
                result[message.payload.correlationId] = correlatedEnds = [];
            }

            correlatedEnds.push(message);

            return result;
        }, {});

        begins.forEach(begin => {
            const allEnds = endsByContext[begin.payload.correlationId];

            if (allEnds && allEnds.length > 0) {
                const end = allEnds[allEnds.length - 1];
                const isGroup = end.types.indexOf(Glimpse.Messages.Payloads.Log.GroupEndType) > -1;

                begin.correlations = {
                    end,
                    isBegin: true,
                    isGroup,
                    ends: allEnds
                };
            }
        });

        ends.forEach(end => {
            const begin = beginsByContext[end.payload.correlationId];

            if (begin) {
                const isGroup =
                    begin.types.indexOf(Glimpse.Messages.Payloads.Log.GroupBeginType) > -1;

                end.correlations = { begin, isEnd: true, isGroup };
            }
        });
    }

    function calculateGroupingState(
        messages: ILoggingMessage[],
        collapsedState: (message: ILoggingMessage) => boolean
    ) {
        let previousMessage;
        const groupingStack = [];

        // move through each record and work out grouping data
        messages.forEach((message, x) => {
            // apply to current group state to nessage
            message.group = cloneGroupFrame(groupingStack);

            // since the begin indexs are alway garentied to get greater, its only the bottoms that can
            // be interlaced, hence why we are only tracking bottom positons. Also when thinking about
            // tracking states because we are moving from right to left, we are interested in what groups
            // are opened to the left (where the end position of that group is less than the group thats
            // closed) and what groups are opened to the right (where the end position that group is greater
            // than the group that is closed). Note, all this is realtive to message at the current index.
            // These key potions are what `bottomOpenIndex` & `bottomCloseIndex` are tracking.
            let isVisible = !(
                message.correlations &&
                message.correlations.isEnd &&
                message.correlations.isGroup
            );
            if (isVisible) {
                let bottomOpenIndex = 0; // used to put a lower limit on what might be in the open region
                let bottomCloseIndex = 0; // used to put a lower limit on what might be in the closed region
                for (let i = message.group.length - 1; i > -1; i--) {
                    let frame = message.group[i];
                    if (frame.isActive) {
                        if (frame.isClosed) {
                            // tracking the index of the lowest closed frame
                            if (frame.end.index > bottomCloseIndex) {
                                bottomCloseIndex = frame.end.index;
                            }
                            // mark message as not visable when, additional logic here because we want to make sure
                            // that begining messages show up when required
                            if (
                                (!message.correlations ||
                                    !message.correlations.isGroup ||
                                    (message.correlations &&
                                        message.correlations.isGroup &&
                                        frame.begin !== message.correlations.begin &&
                                        message.correlations.end.index < frame.end.index)) &&
                                bottomCloseIndex > bottomOpenIndex
                            ) {
                                isVisible = false;
                            }
                        } else {
                            // tracking the index of the lowest open frame
                            if (frame.end.index > bottomOpenIndex) {
                                bottomOpenIndex = frame.end.index;
                            }
                            // revert the message to visable if the message is interlaced
                            if (
                                bottomOpenIndex > message.index &&
                                bottomCloseIndex > bottomOpenIndex
                            ) {
                                isVisible = true;
                            }
                        }
                    }
                }
            }
            message.isVisible = isVisible;

            // dealing with stack management
            if (message.correlations && message.correlations.isGroup) {
                // building up the stack when we have new begin
                if (message.correlations && message.correlations.isBegin) {
                    message.isCollapsed = collapsedState(message);
                    // create a new group record and add to the stack
                    groupingStack.push({
                        isActive: true,
                        begin: message,
                        end: message.correlations.end,
                        isClosed: message.isCollapsed
                    });
                }

                // tear down the stack when we have an end
                if (message.correlations && message.correlations.isEnd) {
                    // since we have an end we need to work through each frame to adjust the state
                    for (let i = groupingStack.length - 1; i > -1; i--) {
                        let frame = groupingStack[i];
                        // we only do something once we have a match
                        if (message.payload.correlationId === frame.begin.payload.correlationId) {
                            // need to inform the previous message that it's the ending frame
                            if (previousMessage && previousMessage.group) {
                                previousMessage.group[i].isEnding = true;
                            }

                            // if we are the top frame we need to trigger a pop
                            if (i === groupingStack.length - 1) {
                                // when we are popping, we need to see what else is on the stack and if its not active, remove it as well
                                do {
                                    groupingStack.pop();
                                    frame = groupingStack.length
                                        ? groupingStack[groupingStack.length - 1]
                                        : undefined;
                                } while (frame && !frame.isActive);
                            } else {
                                // else we are preserving the frame (i.e. no removing) but need to make it inactive (it will be removed when a pop occurs)
                                frame.isActive = false;
                            }

                            // no need to continue moving down the stack
                            break;
                        }
                    }
                }
            } else {
                previousMessage = message;
            }
        });
    }

    function calculateTableState(messages, collapsedState: (message: ILoggingMessage) => boolean) {
        for (const message of messages) {
            if (message.types.indexOf(Glimpse.Messages.Payloads.Log.TableType) !== -1) {
                message.isCollapsed = collapsedState(message);
            }
        }
    }

    return createSelector(
        getSelectedContext,
        getExpansionState,
        getServerOffsetFactor,
        (selectedContext, expansionState, offsetFactor): ILoggingMessage[] => {
            if (selectedContext) {
                const rawMessages = getMessageByType<ILoggingMessagePayloads>(
                    selectedContext.byType,
                    Glimpse.Messages.Payloads.Log.WriteType
                );

                // TODO: this creates a new model every time, for stateless components to work this needs
                //       to reuse models
                let messages = buildMessageModels(rawMessages, offsetFactor);

                matchCorrelatedMessage(messages);

                // NOTE!!! This is wrong. Since the grouping logic is applied before the filters are applied
                //         we end up with the grouping logic flagging messages as being the last item in them
                //         group which may ultimately be excluded. This results in the UI not rendering closing
                //         group "foot" correctly. With the way this selector works currently there isn't really
                //         a good way to fix this. To fix this, we would need to break ILoggingMessage into
                //         multiple parts where grouping data is held outsie of the main message array itself
                //         and rerun when the filters change. Changing this probably isn't as simple as shifting
                //         this logic as it is to after the filter, as it means that `calculateGroupingState`
                //         will run all the time which we don't really want. This structure of ILoggingMessage
                //         should be rewritten to support making this more performant.
                const groupsCollapsed = (message: ILoggingMessage) => {
                    return !isExpanded(
                        expansionState,
                        ['logs', message.messageId],
                        !message.payload.isCollapsed
                    );
                };
                calculateGroupingState(messages, groupsCollapsed);
                // We never want the ending messages to be a part of the data set, hence remove them
                // Note: this shouldn't really be there, but this can get addressed when the above issue is.
                messages = messages.filter(message => {
                    return !(
                        message.correlations &&
                        message.correlations.isGroup &&
                        message.correlations.isEnd
                    );
                });

                const tablesCollapsed = (message: ILoggingMessage) => {
                    return !isExpanded(expansionState, ['logs', message.messageId], true);
                };
                calculateTableState(messages, tablesCollapsed);

                return messages;
            }

            return [];
        }
    );
})();

//
// FILTERED RECORDS SELECTORS
//

const getLevelFiltersState = (state: IStoreState) =>
    state.persisted.global.requests.details.logging.filters.level;

const getAgentFiltersState = (state: IStoreState) =>
    state.persisted.global.requests.details.logging.filters.agent;

function filterLoggingRecords(
    messages: ILoggingMessage[],
    filter: (e: ILoggingMessage) => boolean
): ILoggingMessage[] {
    return messages.filter(filter);
}

/**
 * Function to get all explored categories.
 *
 * @param {Object} State Redux state.
 * @returns {Object} Explored categories.
 */
export const getExploredCategories = (state: IStoreState) => {
    return state.session.logging.exploredCategories;
};

/**
 * Function to get selected logging category.
 *
 * @param {Object} State Redux state.
 * @returns {String} Selected category.
 */
export const getSelectedCategory = (state: IStoreState): string => {
    return state.session.logging.selectedCategory;
};

/**
 * selector that will return logging messagesfiltered by agents (e.g., browser or server events)
 */
export const getAgentFilteredLoggingMessages = createSelector(
    getLoggingMessages,
    getAgentFiltersState,
    (messages, agentFilters): ILoggingMessage[] => {
        return filterLoggingRecords(messages, (message): boolean => {
            // we want others to be included by default otherwise there would be no way to see them
            return message.agent === AgentType.Other || agentFilters[message.agent];
        });
    }
);

/**
 * selector that will return logging messagesfiltered by agents (e.g., browser or server events)
 */
export const getAgentFilteredLoggingMessagesWithCategories = createSelector(
    getAgentFilteredLoggingMessages,
    getSelectedCategory,
    (messages, selectedCategory): ILoggingMessage[] => {
        return filterLoggingRecords(messages, (message): boolean => {
            // if selected category is the default `Show all` then ignore the category
            // else take the category of the message into accaount
            return selectedCategory === selectedCategoryInitialState
                ? true
                : selectedCategory === message.payload.category;
        });
    }
);

/**
 * selector that will return logging messages filtered by level (e.g., error, warn, etc)
 */
const getLevelFilteredLoggingMessages = createSelector(
    getAgentFilteredLoggingMessagesWithCategories,
    getLevelFiltersState,
    (messages, levelFilters): ILoggingMessage[] => {
        return filterLoggingRecords(messages, (message): boolean => {
            // messages with no levels should be included by default otherwise there woul be no way to see them
            return message.level === undefined || levelFilters[message.level];
        });
    }
);

/**
 * selector that will return final set of filtered logging messages
 */
export const getFilteredLoggingMessages = getLevelFilteredLoggingMessages;

export const getVisibleLoggingMessages = createSelector(
    getFilteredLoggingMessages,
    (messages): ILoggingMessage[] => {
        if (messages.length > 0) {
            const visableMessages = messages.filter(message => {
                return message.isVisible;
            });

            return visableMessages;
        }

        return [];
    }
);

/**
 * Function to get all explored categories.
 *
 * @param {Object} State Redux state.
 * @returns {Object} Explored categories.
 */
export const getCurrentExploredCategories = createSelector(
    getVisibleLoggingMessages,
    (messages: ILoggingMessage[]): ILoggingExploredCategories => {
        const currentExploredCategories = {};
        for (let message of messages) {
            const { category } = message.payload;
            if (category !== undefined) {
                currentExploredCategories[category] = true;
            }
        }
        return currentExploredCategories;
    }
);

/**
 * selector that will return logging messagesfiltered by agents (e.g., browser or server events)
 */
export const getCurrentExploredCategoriesCount = createSelector(
    getAgentFilteredLoggingMessages,
    messages => {
        const currentExploredCategories = {};
        for (let message of messages) {
            const { category } = message.payload;
            if (category !== undefined) {
                const currentRecord: number = currentExploredCategories[category];
                currentExploredCategories[category] = currentRecord === undefined
                    ? 1
                    : currentRecord + 1;
            }
        }
        return currentExploredCategories;
    }
);

//
// COUNT RECORDS SELECTORS
//

function count<T>(values: Array<T>, test: (value: T) => boolean): number {
    let count = 0;
    for (let i = 0; i < values.length; i++) {
        if (test(values[i])) {
            count++;
        }
    }
    return count;
}

function isCountable(message: ILoggingMessage) {
    return message.agent !== AgentType.Other;
}

export const getCountableMessageCount = createSelector(getLoggingMessages, (messages): number => {
    return count(messages, message => isCountable(message));
});

export const getCountableFilteredMessageCount = createSelector(
    getFilteredLoggingMessages,
    (messages): number => {
        return count(messages, message => isCountable(message));
    }
);

//
// FILTER STATE SELECTORS
//

export const getUnfilteredByAgentCounts = createSelector(
    getLoggingMessages,
    (messages): ILoggingAgentCount[] => {
        const counts: number[] = [];

        const names = getNamesForEnum(AgentType);
        for (let i = 0; i < names.length; i++) {
            counts[AgentType[names[i]]] = 0;
        }

        for (let i = 0; i < messages.length; i++) {
            counts[messages[i].agent] = counts[messages[i].agent] + 1;
        }

        return names.map(n => {
            return {
                name: n,
                count: counts[AgentType[n]],
                agent: AgentType[n]
            };
        });
    }
);

export const getAgentFiltersSummaries = createSelector(
    getUnfilteredByAgentCounts,
    getAgentFiltersState,
    (agentCounts, agentFilters): ILoggingAgentSummary[] => {
        return agentCounts
            .map(entry => {
                return {
                    name: entry.name,
                    count: entry.count,
                    agent: entry.agent,
                    isShown: agentFilters[entry.agent]
                };
            })
            .filter(e => e.agent !== AgentType.Other);
    }
);

function countMessagesByLevel(messages): ILoggingLevelCount[] {
    const counts: number[] = [];

    const names = getNamesForEnum(LoggingMessageLevel);
    for (let i = 0; i < names.length; i++) {
        counts[LoggingMessageLevel[names[i]]] = 0;
    }

    for (let i = 0; i < messages.length; i++) {
        counts[messages[i].level] = counts[messages[i].level] + 1;
    }

    return names.map(n => {
        return {
            name: n,
            count: counts[LoggingMessageLevel[n]],
            level: LoggingMessageLevel[n]
        } as ILoggingLevelCount;
    });
}

export const getUnfilteredByLevelCounts = createSelector(getLoggingMessages, countMessagesByLevel);

export const getLevelFiltersSummaries = (function() {
    const getByLevelCounts = createSelector(getAgentFilteredLoggingMessages, countMessagesByLevel);

    // the "by-level" counts always reflect the counts of events filtered by agent
    return createSelector(
        getByLevelCounts,
        getLevelFiltersState,
        (levelCounts, levelFilters): ILoggingLevelSummary[] => {
            return levelCounts.map(entry => {
                return {
                    name: entry.name,
                    count: entry.count,
                    level: entry.level,
                    isShown: levelFilters[entry.level]
                };
            });
        }
    );
})();



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/logging/LoggingSelectors.ts