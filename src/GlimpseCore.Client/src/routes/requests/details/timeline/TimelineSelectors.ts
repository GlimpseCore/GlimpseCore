import * as Glimpse from '@_glimpse/glimpse-definitions';
import { createSelector } from 'reselect';

import { ILoggingMessage, LoggingMessageLevel } from '../logging/LoggingInterfaces';
import {
    TimelineEventCategory,
    AgentType,
    ITimelineAgentSummary,
    ITimelineAgentCount,
    ITimelineEvent,
    ITimelineSpan,
    ISlowTimelineSpan,
    ITimelineEvents,
    IFilteredTimelineEvents,
    ISelectedTimelineEvents,
    ITimelineFilterValue,
    ITimelineCategorySummary,
    ITimelineCategoryCount
} from './TimelineInterfaces';
import { IMessage } from '@modules/messages/schemas/IMessage';
import { IStoreState } from '@client/IStoreState';
import { IContext } from '@routes/requests/RequestsInterfaces';

import { convertStringToAgentType } from './TimelineUtils';
import { getCorrelatedMiddlewareMessages } from '../request/RequestMiddlewareSelectors';
import { getLoggingMessages } from '../logging/LoggingSelectors';
import { getNamesForEnum, getIntegersForEnum } from '@common/util/CommonUtilities';
import {
    getWebRequest,
    getWebResponse,
    getServerOffsetFactor,
    getBrowserNavigationTiming
} from '../request/RequestSelectors';
import { getWebServiceExchanges } from '../service/ServiceSelectors';
import { IExchangeModel } from '../service/ServiceInterfaces';
import { getOperations } from '../data/DataSelectors';
import { IDataOperation, DataDatabaseType, DataOperationType } from '../data/DataInterfaces';
import {
    getSelectedRequestPersistedState,
    getMessageByType
} from '@routes/requests/RequestsSelector';
import { getSelectedContext } from '../RequestsDetailsSelector';
import { initialTimelineSelectedOffsetsState } from './TimelineReducers';

// tslint:disable-next-line:no-var-requires
import sprintfjs from '@common/util/printf';

interface ICorrelatedMessage<T> {
    message: IMessage<T>;
    correlatedEvents: ITimelineEvent[];
}

//
// ROOT RECORDS SELECTORS
//

const getWebRequestTimelineEventSelector = createSelector(
    getWebRequest,
    getServerOffsetFactor,
    getServerOffsetFactor,
    (webRequest, offsetFactor): ITimelineEvent[] => {
        const events: ITimelineEvent[] = [];
        if (webRequest) {
            const offset = offsetFactor + webRequest.offset;
            const e: ITimelineEvent = {
                eventId: webRequest.id,
                ordinal: webRequest.ordinal,
                title: 'Request | Received',
                offset: offset,
                source: AgentType.Server,
                category: TimelineEventCategory.Request,
                rawMessages: [webRequest]
            };
            events.push(e);
        }
        return events;
    }
);

const getWebResponseTimelineEventSelector = createSelector(
    getWebResponse,
    getServerOffsetFactor,
    (webResponse, offsetFactor): ITimelineSpan[] => {
        const events: ITimelineSpan[] = [];
        if (webResponse) {
            const offset = offsetFactor + webResponse.offset;
            const e: ITimelineSpan = {
                eventId: webResponse.id,
                ordinal: webResponse.ordinal,
                index: 0, // index will get updated later after we sort all messages by ordinal
                title: 'Request | Write Response',
                offset: offset,
                sortOffset: offset,
                // duration is the difference between the requestStart offset and the requestEnd offset
                duration:
                    webResponse.payload.timing.responseEnd -
                        webResponse.payload.timing.responseStart,
                source: AgentType.Server,
                category: TimelineEventCategory.Request,
                rawMessages: [webResponse]
            };
            events.push(e);
        }
        return events;
    }
);

const getMiddlewareTimelineEventsSelector = createSelector(
    getCorrelatedMiddlewareMessages,
    (correlatedMiddleware): ITimelineSpan[] => {
        const events: ITimelineSpan[] = [];
        for (let i = 0; i < correlatedMiddleware.length; i++) {
            const middleware = correlatedMiddleware[i];
            const start = middleware.startMessage;
            const end = middleware.endMessage;
            let middlewareName = start.payload.displayName || start.payload.name;
            if (!middlewareName || middlewareName === '<anonymous>') {
                middlewareName = '[anonymous]';
            }

            const frames = start.payload && start.payload.frames;

            const e: ITimelineSpan = {
                eventId: start.id,
                ordinal: start.ordinal,
                index: 0, // index will get updated later after we sort all messages by ordinal
                title: `Middleware | ${middlewareName}`,
                offset: middleware.offset, // already takes into account offset factor
                sortOffset: middleware.offset,
                duration: end ? end.payload.duration : 0,
                frames: frames || [],
                source: AgentType.Server,
                category: TimelineEventCategory.Request,
                rawMessages: [start, end]
            };
            events.push(e);
        }
        return events;
    }
);

const getHttpRequestsTimelineEventsSelector = createSelector(
    getWebServiceExchanges,
    (exchanges: IExchangeModel[]): ITimelineSpan[] => {
        const spans: ITimelineSpan[] = [];
        for (let i = 0; i < exchanges.length; i++) {
            const exchange = exchanges[i];
            let titleStatus = '';
            if (exchange.response && exchange.response.payload.statusCode) {
                if (exchange.response.payload.statusMessage) {
                    titleStatus = ` (${exchange.response.payload.statusCode} ${exchange.response
                        .payload.statusMessage})`;
                } else {
                    titleStatus = ` (${exchange.response.payload.statusCode})`;
                }
            }
            const title = exchange.request
                ? `Service | ${exchange.request.payload.method}: ${exchange.request.payload
                      .url}${titleStatus}`
                : 'Service';
            const frames =
                exchange.request && exchange.request.payload && exchange.request.payload.frames;

            const span: ITimelineSpan = {
                eventId: exchange.eventId,
                ordinal: exchange.ordinal,
                index: 0, // index will get updated later after we sort all messages by ordinal
                title,
                offset: exchange.offset,
                sortOffset: exchange.offset,
                frames: frames || [],
                duration: exchange.response ? exchange.response.payload.duration : 0,
                source: exchange.agent,
                category: TimelineEventCategory.WebService,
                rawMessages: [exchange.request, exchange.response]
            };
            spans.push(span);
        }
        return spans;
    }
);

const getNetworkTimingEventsSelector = createSelector(
    getSelectedContext,
    (selecteContext: IContext): ITimelineEvent[] => {
        const msg = getBrowserNavigationTiming(selecteContext);

        const events: ITimelineEvent[] = [];
        if (msg) {
            if (msg.payload.navigationStart && msg.payload.domInteractive) {
                const event: ITimelineEvent = {
                    eventId: msg.id + '-dom-interactive',
                    ordinal: msg.ordinal,
                    title: 'Request | DOM Interactive',
                    offset: msg.payload.domInteractive - msg.payload.navigationStart,
                    source: convertStringToAgentType(msg.agent.source),
                    category: TimelineEventCategory.Other,
                    rawMessages: [msg]
                };
                events.push(event);
            }

            if (msg.payload.navigationStart && msg.payload.loadEventStart) {
                const event: ITimelineEvent = {
                    eventId: msg.id + '-load-start',
                    ordinal: msg.ordinal,
                    title: 'Request | Load Start',
                    offset: msg.payload.loadEventStart - msg.payload.navigationStart,
                    source: convertStringToAgentType(msg.agent.source),
                    category: TimelineEventCategory.Other,
                    rawMessages: [msg]
                };
                events.push(event);
            }
        }
        return events;
    }
);

const getNetworkTimingSpansSelector = createSelector(
    getSelectedContext,
    (selecteContext: IContext): ITimelineSpan[] => {
        const timingMessages = getBrowserNavigationTiming(selecteContext);
        const spans: ITimelineSpan[] = [];
        if (timingMessages) {
            // DNS lookup span
            if (
                timingMessages.payload.navigationStart &&
                timingMessages.payload.domainLookupStart &&
                timingMessages.payload.lookupDomainDuration
            ) {
                const offset =
                    timingMessages.payload.domainLookupStart -
                    timingMessages.payload.navigationStart;
                const span: ITimelineSpan = {
                    eventId: timingMessages.id + '-dns-span',
                    ordinal: timingMessages.ordinal,
                    index: 0, // index will get updated later after we sort all messages by ordinal
                    title: 'Request | Domain Lookup',
                    offset: offset,
                    sortOffset: offset,
                    duration: timingMessages.payload.lookupDomainDuration,
                    source: convertStringToAgentType(timingMessages.agent.source),
                    category: TimelineEventCategory.Other,
                    rawMessages: [timingMessages]
                };
                spans.push(span);
            }

            // TCP connection span
            if (
                timingMessages.payload.navigationStart &&
                timingMessages.payload.connectStart &&
                timingMessages.payload.connectDuration
            ) {
                const offset =
                    timingMessages.payload.connectStart - timingMessages.payload.navigationStart;
                const span: ITimelineSpan = {
                    eventId: timingMessages.id + '-tcp-connection-span',
                    ordinal: timingMessages.ordinal,
                    index: 0, // index will get updated later after we sort all messages by ordinal
                    title: 'Request | TCP Connection',
                    offset: offset,
                    sortOffset: offset,
                    duration: timingMessages.payload.connectDuration,
                    source: convertStringToAgentType(timingMessages.agent.source),
                    category: TimelineEventCategory.Other,
                    rawMessages: [timingMessages]
                };
                spans.push(span);
            }

            // TLS handshake span
            if (
                timingMessages.payload.navigationStart &&
                timingMessages.payload.secureConnectionStart &&
                timingMessages.payload.connectEnd
            ) {
                const offset =
                    timingMessages.payload.secureConnectionStart -
                    timingMessages.payload.navigationStart;
                const span: ITimelineSpan = {
                    eventId: timingMessages.id + '-tls-handshake-span',
                    ordinal: timingMessages.ordinal,
                    index: 0, // index will get updated later after we sort all messages by ordinal
                    title: 'Request | TLS Handshake',
                    offset: offset,
                    sortOffset: offset,
                    duration:
                        timingMessages.payload.connectEnd -
                            timingMessages.payload.secureConnectionStart,
                    source: convertStringToAgentType(timingMessages.agent.source),
                    category: TimelineEventCategory.Other,
                    rawMessages: [timingMessages]
                };
                spans.push(span);
            }

            // redirects span
            if (
                timingMessages.payload.navigationStart &&
                timingMessages.payload.redirectStart &&
                timingMessages.payload.redirectDuration
            ) {
                const offset =
                    timingMessages.payload.redirectStart - timingMessages.payload.navigationStart;
                const span: ITimelineSpan = {
                    eventId: timingMessages.id + '-redirect-span',
                    ordinal: timingMessages.ordinal,
                    index: 0, // index will get updated later after we sort all messages by ordinal
                    title: 'Request | Redirects',
                    offset: offset,
                    sortOffset: offset,
                    duration: timingMessages.payload.redirectDuration,
                    source: convertStringToAgentType(timingMessages.agent.source),
                    category: TimelineEventCategory.Other,
                    rawMessages: [timingMessages]
                };
                spans.push(span);
            }
        }
        return spans;
    }
);

const getDataTimelineEventsSelector = (function() {
    function getDataOperationTitle(op: IDataOperation): string {
        const database = DataDatabaseType[op.databaseType];
        let title = `${database} | ${op.method}`;
        if (op.recordCount !== undefined && Number.isInteger(<number>op.recordCount)) {
            title += ` ${op.recordCount} `;
            title += op.recordCount === 1 ? 'Record' : 'Records';
        }
        if (op.operationType !== DataOperationType.Other) {
            title += ` (${op.operation})`;
        }

        return title;
    }

    return createSelector(getOperations, (dataOperations: IDataOperation[]): ITimelineSpan[] => {
        const spans: ITimelineSpan[] = [];
        for (let i = 0; i < dataOperations.length; i++) {
            const op = dataOperations[i];
            const span: ITimelineSpan = {
                eventId: op.eventId,
                ordinal: op.ordinal,
                index: 0, // index will get updated later after we sort all messages by ordinal
                title: getDataOperationTitle(op),
                offset: op.offset,
                sortOffset: op.offset,
                duration: op.duration,
                source: AgentType.Server,
                category: TimelineEventCategory.Data,
                rawMessages: []
            };
            spans.push(span);
        }
        return spans;
    });
})();

const getDebugTimestampMessages = createSelector(
    getSelectedContext,
    (selecteContext: IContext): IMessage<Glimpse.Messages.Payloads.Debug.ITimestamp>[] => {
        return getMessageByType<Glimpse.Messages.Payloads.Debug.ITimestamp>(
            selecteContext.byType,
            Glimpse.Messages.Payloads.Debug.TimestampType
        );
    }
);

const getDebugTimestampMeasurementMessages = createSelector(
    getSelectedContext,
    (
        selecteContext: IContext
    ): IMessage<Glimpse.Messages.Payloads.Debug.ITimestampMeasurement>[] => {
        return getMessageByType<Glimpse.Messages.Payloads.Debug.ITimestampMeasurement>(
            selecteContext.byType,
            Glimpse.Messages.Payloads.Debug.TimestampMeasurementType
        );
    }
);

const getDebugTimestampEventsSelector = createSelector(
    getDebugTimestampMessages,
    getServerOffsetFactor,
    (
        timestampMessages: IMessage<Glimpse.Messages.Payloads.Debug.ITimestamp>[],
        offsetFactor: number
    ): ITimelineEvent[] => {
        return timestampMessages.map(m => {
            const offset = (m.agent.source === 'server' ? offsetFactor : 0) + m.offset;
            return {
                eventId: m.id,
                ordinal: m.ordinal,
                title: `Log | ${m.payload.name} Mark`,
                offset: offset,
                sortOffset: offset,
                source: convertStringToAgentType(m.agent.source),
                category: TimelineEventCategory.Logs,
                customCategoryDescription: `Logs - ${LoggingMessageLevel[
                    LoggingMessageLevel.Debug
                ]}`,
                rawMessages: [m]
            } as ITimelineEvent;
        });
    }
);

const getDebugTimestampMeasurementSpansSelector = (function() {
    function correlateTimestampEvents(
        timestamps: ITimelineEvent[],
        measures: IMessage<Glimpse.Messages.Payloads.Debug.ITimestampMeasurement>[]
    ): ICorrelatedMessage<Glimpse.Messages.Payloads.Debug.ITimestampMeasurement>[] {
        const byId: { [key: string]: ITimelineEvent } = {};

        // assumes that the message ID used as the timeline event ID.
        timestamps.forEach(m => {
            byId[m.eventId] = m;
        });

        return measures.map(measure => {
            const correlations = [];
            measure.payload.correlationMessageIds.forEach(id => {
                const correlatedMessage = byId[id];
                if (correlatedMessage) {
                    correlations.push(correlatedMessage);
                }
            });

            return {
                message: measure,
                correlatedEvents: correlations
            };
        });
    }

    return createSelector(
        getDebugTimestampEventsSelector,
        getDebugTimestampMeasurementMessages,
        getServerOffsetFactor,
        (
            timestampEvents: ITimelineEvent[],
            messages: IMessage<Glimpse.Messages.Payloads.Debug.ITimestampMeasurement>[],
            offsetFactor: number
        ): ITimelineSpan[] => {
            const correlated = correlateTimestampEvents(timestampEvents, messages);

            return correlated.map(m => {
                // find the min & max offset values from correlated messages.
                // This accounts for bad data such as like negative offsets, measures with no correlated messages,
                // and measures with more than 2 correlated messages.
                let minOffset = Number.MAX_SAFE_INTEGER;
                let maxOffset = 0;
                m.correlatedEvents.forEach(e => {
                    if (e.offset < minOffset) {
                        minOffset = e.offset;
                    }

                    if (e.offset > maxOffset) {
                        maxOffset = e.offset;
                    }
                });

                if (minOffset === Number.MAX_SAFE_INTEGER) {
                    minOffset = 0;
                }

                let duration = maxOffset - minOffset;
                const messageOffsetFactor = m.message.agent.source === 'server' ? offsetFactor : 0;

                return {
                    eventId: m.message.id,
                    ordinal: m.message.ordinal, // ordinal is the measure's ordinal message
                    index: 0, // index will get updated later after we sort all messages by ordinal
                    title: `Log | ${m.message.payload.name} Measure`,
                    offset: messageOffsetFactor + minOffset,
                    sortOffset: messageOffsetFactor + m.message.offset, // we want this to be sorted vertically by when the performance.measurement call was made.
                    duration: duration,
                    source: convertStringToAgentType(m.message.agent.source),
                    category: TimelineEventCategory.Logs,
                    rawMessages: [m.message]
                } as ITimelineSpan;
            });
        }
    );
})();

const getConsoleErrorEvents = createSelector(
    getLoggingMessages,
    (logMessages: ILoggingMessage[]): ITimelineEvent[] => {
        const events: ITimelineEvent[] = [];
        for (let i = 0; i < logMessages.length; i++) {
            if (logMessages[i].level === LoggingMessageLevel.Error) {
                let title = 'Error';
                if (Array.isArray(logMessages[i].payload.message)) {
                    // tslint:disable-next-line:no-any
                    const payload: any = logMessages[i].payload as any;
                    const result = sprintfjs(
                        payload.message[0],
                        payload.message.slice(1, payload.message.length),
                        payload.tokenSupport
                    );
                    title = result.formattedResult.textContent;
                } else if (typeof (logMessages[i].payload.message === 'string')) {
                    title = logMessages[i].payload.message.toString();
                }

                const e: ITimelineEvent = {
                    eventId: logMessages[i].messageId,
                    ordinal: logMessages[i].ordinal,
                    title: 'Log | ' + title,
                    offset: logMessages[i].offset,
                    source: logMessages[i].agent as AgentType,
                    category: TimelineEventCategory.Logs,
                    customCategoryDescription: `Logs - ${LoggingMessageLevel[
                        logMessages[i].level
                    ]}`,
                    rawMessages: []
                };
                events.push(e);
            }
        }
        return events;
    }
);

/**
 * selector that will return all unfiltered timeline events
 */

export const getTimelineEvents = (function() {
    function spanSortComparisonFunc(a: ITimelineSpan, b: ITimelineSpan): number {
        if (a.sortOffset === b.sortOffset) {
            // secondary sort by offset
            return a.offset - b.offset;
        }
        return a.sortOffset - b.sortOffset;
    }

    return createSelector(
        getWebRequestTimelineEventSelector,
        getWebResponseTimelineEventSelector,
        getMiddlewareTimelineEventsSelector,
        getHttpRequestsTimelineEventsSelector,
        getNetworkTimingSpansSelector,
        getDataTimelineEventsSelector,
        getDebugTimestampMeasurementSpansSelector,
        getDebugTimestampEventsSelector,
        getConsoleErrorEvents,
        getNetworkTimingEventsSelector,
        (
            webRequestSpans,
            webResponseSpans,
            middlewareSpans,
            httpSpans,
            networkTimingSpans,
            dataSpans,
            measureSpans,
            timestampEvents,
            consoleErrorEvents,
            networkTimingEvents
        ): ITimelineEvents => {
            // sort by ordinal and number the events starting at 1
            const spans: ITimelineSpan[] = webResponseSpans.concat(
                middlewareSpans,
                httpSpans,
                networkTimingSpans,
                dataSpans,
                measureSpans
            );
            spans.sort(spanSortComparisonFunc);

            for (let i = 0; i < spans.length; i++) {
                // make copy of object so they remain immutable
                spans[i] = Object.assign({}, spans[i]);
                // fill in index value
                spans[i].index = i + 1;
            }

            const pointInTimeEvents = webRequestSpans.concat(
                timestampEvents,
                consoleErrorEvents,
                networkTimingEvents
            );
            pointInTimeEvents.sort((a, b) => a.offset - b.offset);

            return {
                spans,
                pointInTimeEvents: pointInTimeEvents
            } as ITimelineEvents;
        }
    );
})();

export const getTimelineEventsOffsetBoundary = createSelector(getTimelineEvents, events => {
    const { spans, pointInTimeEvents } = events;
    const maxActivityOffset = Math.max.apply(
        undefined,
        spans.map(span => span.offset + span.duration)
    );
    const maxPointInTimeOffset = Math.max.apply(
        undefined,
        pointInTimeEvents.map(event => event.offset)
    );
    const maxOffset = Math.max(1, maxActivityOffset, maxPointInTimeOffset);

    return {
        minOffset: 0,
        maxOffset
    };
});

//
// FILTERED RECORDS SELECTORS
//

const getCategoryFiltersState = (state: IStoreState): ITimelineFilterValue =>
    state.persisted.global.requests.details.timeline.filters.category;

const getAgentFiltersState = (state: IStoreState): ITimelineFilterValue =>
    state.persisted.global.requests.details.timeline.filters.agent;

function filterTimelineEvents(
    events: ITimelineEvents,
    filter: (e: ITimelineEvent) => boolean
): ITimelineEvents {
    const filteredSpans: ITimelineSpan[] = events.spans.filter(filter);
    const filteredPointInTimeEvents: ITimelineEvent[] = events.pointInTimeEvents.filter(filter);

    return {
        spans: filteredSpans,
        pointInTimeEvents: filteredPointInTimeEvents
    };
}

/**
 * selector that will return timeline events filtered by agents (e.g., browser or server events)
 */
export const getAgentFilteredTimelineEvents = createSelector(
    getTimelineEvents,
    getAgentFiltersState,
    (events: ITimelineEvents, agentFilters: ITimelineFilterValue) => {
        return filterTimelineEvents(events, (e: ITimelineEvent) => {
            return agentFilters[e.source];
        });
    }
);

/**
 * selector that will return timeline events filtered by category (e.g., data or web service)
 */
const getCategoryFilteredTimelineEvents = createSelector(
    getAgentFilteredTimelineEvents,
    getCategoryFiltersState,
    (events: ITimelineEvents, categoryFilters: ITimelineFilterValue) => {
        return filterTimelineEvents(events, (e: ITimelineEvent) => {
            return categoryFilters[e.category];
        });
    }
);

/**
 * selector that will return final set of filtered timeline events
 */
export const getFilteredTimelineEvents = (function() {
    function createSlownessMap(spansByDuration: ITimelineSpan[]): { [key: string]: number } {
        const eventIDsToSlowness = {};

        let lastDuration = -1;
        for (let i = 0, curr = 0; i < spansByDuration.length; i++) {
            if (spansByDuration[i].duration !== lastDuration) {
                ++curr;
            }
            eventIDsToSlowness[spansByDuration[i].eventId] = curr;
            lastDuration = spansByDuration[i].duration;
        }
        return eventIDsToSlowness;
    }

    return createSelector(
        getCategoryFilteredTimelineEvents,
        (events: ITimelineEvents): IFilteredTimelineEvents => {
            // Sort the spans by duration, making a copy of the spans first to leave
            // the original spans list unsorted, since sort() is in place
            const spansByDuration = events.spans.slice(0);
            spansByDuration.sort((a, b) => b.duration - a.duration);

            const eventIDsToSlowness = createSlownessMap(spansByDuration);

            return Object.assign(
                {
                    spansByDuration,
                    eventIDsToSlowness
                },
                events
            );
        }
    );
})();

export const MAX_OVERVIEW_EVENTS = 45;

export const getOverviewTimelineEvents = createSelector(getFilteredTimelineEvents, events => {
    const maxEvents = MAX_OVERVIEW_EVENTS;

    if (events.spans.length > maxEvents) {
        const spans = events.spansByDuration // Order by longest duration...
            // Take the top N-spans...
            .slice(0, maxEvents)
            // Revert the spans to their original order...
            .sort((a, b) => a.index - b.index);

        return {
            spans,
            pointInTimeEvents: events.pointInTimeEvents,
            maxEvents,
            wasTruncated: true
        };
    }

    return {
        spans: events.spans,
        pointInTimeEvents: events.pointInTimeEvents,
        maxEvents,
        wasTruncated: false
    };
});

function isNullOrUndefined(val): boolean {
    //tslint:disable-next-line:no-null-keyword
    return val === undefined || val === null;
}

export const getSelectedOffsetsForSelectedContext = createSelector(
    getSelectedRequestPersistedState,
    selectedRequestPersistedState => {
        let selectedOffsets = selectedRequestPersistedState
            ? selectedRequestPersistedState.details.timeline.selectedOffsets
            : initialTimelineSelectedOffsetsState;

        // offsets should never be equal, as the TimelineTable will throw
        // enforce that here, as it is the, simplest most central place
        if (
            !isNullOrUndefined(selectedOffsets.maxOffset) &&
            selectedOffsets.maxOffset === selectedOffsets.minOffset
        ) {
            selectedOffsets = Object.assign(selectedOffsets, {
                maxOffset: selectedOffsets.maxOffset + 1
            });
        }

        return selectedOffsets;
    }
);

export const getSelectedTimelineEvents = createSelector(
    getFilteredTimelineEvents,
    getTimelineEventsOffsetBoundary,
    getSelectedOffsetsForSelectedContext,
    (events, boundary, selectedOffsets): ISelectedTimelineEvents => {
        // 0 is a valid value for selectedOffset, so only use boundary min/max if selected min/max is null or undefined
        const minOffset = isNullOrUndefined(selectedOffsets.minOffset)
            ? boundary.minOffset
            : selectedOffsets.minOffset;
        const maxOffset = isNullOrUndefined(selectedOffsets.maxOffset)
            ? boundary.maxOffset
            : selectedOffsets.maxOffset;

        const spans = events.spans.filter(
            span => span.offset <= maxOffset && span.offset + span.duration >= minOffset
        );
        const pointInTimeEvents = events.pointInTimeEvents.filter(
            event => event.offset <= maxOffset && event.offset >= minOffset
        );

        return {
            minOffset,
            maxOffset,
            spans,
            pointInTimeEvents,
            eventIDsToSlowness: events.eventIDsToSlowness
        };
    }
);

/**
 * Returns the total "duration" for a given context, using the maximum offset found in both timeline spans and events.
 */
export const getTotalTimelineDuration = createSelector(
    getTimelineEvents,
    (events: ITimelineEvents) => {
        const maxSpanOffset = events.spans.reduce(
            (previous, span) => Math.max(previous, span.offset + span.duration),
            0
        );
        const maxEventOffset = events.pointInTimeEvents.reduce(
            (previous, event) => Math.max(previous, event.offset),
            0
        );

        return Math.max(maxSpanOffset, maxEventOffset);
    }
);

/**
 * Currently, the top three slowest events are displayed on the timeline page.
 * If we need more in the future, update this method here to include more or less.
 */
export const getSlowestTimelineEvents = (function() {
    function createSlowEvent(
        span: ITimelineSpan,
        selectedEvents: ISelectedTimelineEvents
    ): ISlowTimelineSpan {
        if (!span) {
            return;
        }
        return Object.assign(
            {
                isVisible: selectedEvents.eventIDsToSlowness.hasOwnProperty(span.eventId)
            },
            span
        );
    }

    return createSelector(
        getFilteredTimelineEvents,
        getSelectedTimelineEvents,
        (events, selectedEvents): ISlowTimelineSpan[] => {
            return [
                createSlowEvent(events.spansByDuration[0], selectedEvents),
                createSlowEvent(events.spansByDuration[1], selectedEvents),
                createSlowEvent(events.spansByDuration[2], selectedEvents)
            ];
        }
    );
})();

//
// COUNT RECORDS SELECTORS
//

export const getUnfilteredByAgentCounts = createSelector(
    getTimelineEvents,
    (events: ITimelineEvents): ITimelineAgentCount[] => {
        const counts: number[] = [];

        const names = getNamesForEnum(AgentType);
        for (let i = 0; i < names.length; i++) {
            counts[AgentType[names[i]]] = 0;
        }

        for (let i = 0; i < events.spans.length; i++) {
            counts[events.spans[i].source] = counts[events.spans[i].source] + 1;
        }

        for (let i = 0; i < events.pointInTimeEvents.length; i++) {
            counts[events.pointInTimeEvents[i].source] =
                counts[events.pointInTimeEvents[i].source] + 1;
        }

        return names.map(n => {
            return {
                name: n,
                count: counts[AgentType[n]],
                agent: AgentType[n]
            } as ITimelineAgentCount;
        });
    }
);

export const getAgentFilterSummaries = createSelector(
    getUnfilteredByAgentCounts,
    getAgentFiltersState,
    (agentCounts, agentFilters: ITimelineFilterValue): ITimelineAgentSummary[] => {
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

function countByCategory(events: ITimelineEvents): ITimelineCategoryCount[] {
    const counts: number[] = [];

    const enumVals = getIntegersForEnum(TimelineEventCategory);
    for (let i = 0; i < enumVals.length; i++) {
        counts[i] = 0;
    }

    for (let i = 0; i < events.spans.length; i++) {
        counts[events.spans[i].category] = counts[events.spans[i].category] + 1;
    }

    for (let i = 0; i < events.pointInTimeEvents.length; i++) {
        counts[events.pointInTimeEvents[i].category] =
            counts[events.pointInTimeEvents[i].category] + 1;
    }

    return enumVals.map(v => {
        return {
            name: v === TimelineEventCategory.WebService
                ? 'Web services'
                : TimelineEventCategory[v],
            count: counts[v],
            category: v
        } as ITimelineCategoryCount;
    });
}

export const getUnfilteredByCategoryCounts = createSelector(getTimelineEvents, countByCategory);

export const getCategoryFilterSummaries = (function() {
    const getFilteredByCategoryCounts = createSelector(
        getAgentFilteredTimelineEvents,
        countByCategory
    );

    // the "by-category" summary counts always reflect the counts of events filtered by agent
    return createSelector(
        getFilteredByCategoryCounts,
        getCategoryFiltersState,
        (categoryCounts, categoryFilters: ITimelineFilterValue): ITimelineCategorySummary[] => {
            return categoryCounts.map(entry => {
                return {
                    name: entry.name,
                    count: entry.count,
                    category: entry.category,
                    isShown: categoryFilters[entry.category]
                };
            });
        }
    );
})();

/*
    Sample data that matches the UX mocks.

function getTimelineEvents() {
    const spans: ITimelineSpan[] = [
        {
            ordinal: 1,
            eventId: '1',
            index: 1,
            source: AgentType.Server,
            category: TimelineEventCategory.Logs,
            title: 'Start Request',
            offset: 0,
            duration: 30,
            rawMessages: []
        },
        {
            ordinal: 2,
            eventId: '2',
            index: 2,
            source: AgentType.Server,
            category: TimelineEventCategory.Logs,
            title: 'Authorization: Home.Index',
            offset: 4,
            duration: 40,
            rawMessages: []
        },
        {
            ordinal: 3,
            eventId: '3',
            index: 3,
            source: AgentType.Server,
            category: TimelineEventCategory.Logs,
            title: 'Action Executing: Home.Index',
            offset: 37,
            duration: 8,
            rawMessages: []
        },
        {
            ordinal: 4,
            eventId: '4',
            index: 4,
            source: AgentType.Server,
            category: TimelineEventCategory.Request,
            title: 'Controller: Home.Index',
            offset: 46,
            duration: 154,
            rawMessages: []
        },
        {
            ordinal: 5,
            eventId: '5',
            index: 5,
            source: AgentType.Browser,
            category: TimelineEventCategory.Request,
            title: 'Connection: Opened',
            offset: 48,
            duration: 48,
            rawMessages: []
        },
        {
            ordinal: 6,
            eventId: '6',
            index: 6,
            source: AgentType.Browser,
            category: TimelineEventCategory.Data,
            title: 'User \'nikmd23\' searched for \'DVDs\'',
            offset: 90,
            duration: 59,
            rawMessages: []
        },
        {
            ordinal: 7,
            eventId: '7',
            index: 7,
            source: AgentType.Browser,
            category: TimelineEventCategory.Data,
            title: 'profile.me/get&123...userNoss.js',
            offset: 149,
            duration: 33,
            rawMessages: []
        },
        {
            ordinal: 8,
            eventId: '8',
            index: 8,
            source: AgentType.Browser,
            category: TimelineEventCategory.Data,
            title: 'Action Executed: Home.index',
            offset: 183,
            duration: 17,
            rawMessages: []
        },
        {
            ordinal: 9,
            eventId: '9',
            index: 9,
            source: AgentType.Browser,
            category: TimelineEventCategory.Request,
            title: 'Result Executing: Home.Index',
            offset: 183,
            duration: 17,
            rawMessages: []
        },
        {
            ordinal: 10,
            eventId: '10',
            index: 10,
            source: AgentType.Browser,
            category: TimelineEventCategory.Request,
            title: 'Action Result: Home.Index',
            offset: 201,
            duration: 18,
            rawMessages: []
        },
        {
            ordinal: 11,
            eventId: '11',
            index: 11,
            source: AgentType.Browser,
            category: TimelineEventCategory.Request,
            title: 'Render: Home.Index',
            offset: 101,
            duration: 26,
            rawMessages: []
        },
        {
            ordinal: 12,
            eventId: '12',
            index: 12,
            source: AgentType.Browser,
            category: TimelineEventCategory.Request,
            title: 'Authorization: ShoppingCard.Cartcenterton',
            offset: 127,
            duration: 12,
            rawMessages: []
        },
        {
            ordinal: 13,
            eventId: '13',
            index: 13,
            source: AgentType.Browser,
            category: TimelineEventCategory.WebService,
            title: 'Authorization: ShoppingCart.Cartcenterton',
            offset: 127,
            duration: 11,
            rawMessages: []
        },
        {
            ordinal: 14,
            eventId: '14',
            index: 14,
            source: AgentType.Browser,
            category: TimelineEventCategory.WebService,
            title: 'Authorization: ShoppingCat.Cartcenterton.titleWithoutSomething',
            offset: 179,
            duration: 25,
            rawMessages: []
        },
        {
            ordinal: 15,
            eventId: '15',
            index: 15,
            source: AgentType.Browser,
            category: TimelineEventCategory.WebService,
            title: 'Authorization: ShoppingCart.Cartcenterton',
            offset: 203,
            duration: 89,
            rawMessages: []
        },
        {
            ordinal: 16,
            eventId: '16',
            index: 16,
            source: AgentType.Browser,
            category: TimelineEventCategory.Request,
            title: 'Connection: Opened',
            offset: 203,
            duration: 30,
            rawMessages: []
        },
        {
            ordinal: 17,
            eventId: '17',
            index: 17,
            source: AgentType.Browser,
            category: TimelineEventCategory.Data,
            title: 'Command: Executed',
            offset: 220,
            duration: 35,
            rawMessages: []
        },
        {
            ordinal: 18,
            eventId: '18',
            index: 18,
            source: AgentType.Browser,
            category: TimelineEventCategory.Data,
            title: 'Result Excecuted: ShoppingCart.Cart',
            offset: 101,
            duration: 10,
            rawMessages: []
        },
        {
            ordinal: 19,
            eventId: '19',
            index: 19,
            source: AgentType.Browser,
            category: TimelineEventCategory.Logs,
            title: 'Authorization: Store.GenreMeu',
            offset: 111,
            duration: 33,
            rawMessages: []
        },
        {
            ordinal: 20,
            eventId: '20',
            index: 20,
            source: AgentType.Server,
            category: TimelineEventCategory.WebService,
            title: 'End Request',
            offset: 356,
            duration: 344,
            rawMessages: []
        }
    ];

    return {
        spans
    };
}
*/



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/TimelineSelectors.ts