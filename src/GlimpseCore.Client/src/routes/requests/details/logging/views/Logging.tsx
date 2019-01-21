import * as Glimpse from '@_glimpse/glimpse-definitions';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import includes from 'lodash/includes';
import isObjectLike from 'lodash/isObjectLike';

import ExpandCollapseButton from '@routes/requests/components/ExpandCollapseButton';
import ExpandableText from '@routes/requests/components/ExpandableText';
import {
    getVisibleLoggingMessages,
    getCountableMessageCount,
    getExploredCategories,
    getCurrentExploredCategories,
    getCountableFilteredMessageCount
} from '../LoggingSelectors';

import { getSelectedContextId } from '@routes/requests/RequestsSelector';
import { areObjectsEqual } from '@common/util/ObjectUtilities';
import { templateBatchProcessor } from '@common/util/TemplateProcessor';
import { ILoggingMessage, LoggingMessageLevel } from '../LoggingInterfaces';
import { IStoreState } from '@client/IStoreState';

import commonStyles from '@common/components/Common.scss';
import styles from './Logging.scss';
import { Icon } from '@common/components/Icon';
import MessageRowTarget from '@common/components/MessageRowTarget';

import AgentTypeIcon from '@common/components/AgentTypeIcon';
import LoggingLevelIcon from './LoggingLevelIcon';
import ExpandCollapseAllBar from '@routes/requests/components/ExpandCollapseAllBar';
import JsonTree from '@routes/requests/components/JsonTree';
import JsonTable from '@routes/requests/components/JsonTable';
import LoggingLabel from './LoggingLabel';
import LoggingStatement from './LoggingStatement';
import LoggingTimeSpan from './LoggingTimeSpan';
import LoggingFilterBarContainer from './LoggingFilterBar';
import StackFrame from '@common/components/StackFrame';
import { TimeDuration } from '@common/components/TimeDuration';

import { addExploredCategoryAction } from '@routes/requests/details/logging/LoggingActions';
import { ILoggingExploredCategories } from '@routes/requests/details/logging/LoggingInterfaces';
import { FilterHeader } from '@common/components/FilterHeader';

export interface ILoggingProps {
    contextId: string;
    filteredMessages: ILoggingMessage[];
    totalMessageCount: number;
    filteredMessageCount: number;
    isExploredCategories: boolean;
    storeExploredCategories: ILoggingExploredCategories;
    exploredCategories: ILoggingExploredCategories;
}

export interface ILoggingCallbacks {
    saveExploredCategories: (exploredCategories) => void;
    selectCategory: (name: string) => void;
}

export class LoggingView extends React.Component<ILoggingProps & ILoggingCallbacks, {}> {
    public componentDidUpdate() {
        const { exploredCategories, storeExploredCategories, saveExploredCategories } = this.props;
        // Definition:
        //  (1) categories explored in this section
        //  (2) explored categories from the store
        //
        // if (1) + (2) !== (2) then we have explored
        // a new category and need to save it
        if (!areObjectsEqual(exploredCategories, storeExploredCategories)) {
            saveExploredCategories(exploredCategories);
        }
    }

    public render() {
        const { totalMessageCount, filteredMessageCount } = this.props;
        const ordinalWidth = 40;
        const levelWidth = 80;
        const categoryWidth = 80;
        const messageWidth = '75%';
        const offsetWidth = 80;
        const locationWidth = '25%';

        const { filteredMessages, contextId, isExploredCategories } = this.props;

        const categoryModifier = isExploredCategories ? styles.isVisible : '';
        const colSpanModifier: number = isExploredCategories ? 1 : 0;

        return (
            <div className={classNames(styles.logView, commonStyles.contextSection)}>
                <div className={commonStyles.tabViewHeader}>
                    <FilterHeader
                        count={filteredMessageCount}
                        totalCount={totalMessageCount}
                        eventName="message"
                    />
                    <div className={commonStyles.tabViewFilterHeader}>
                        <LoggingFilterBarContainer />
                        <div className={styles.logViewExpandCollapseAll}>
                            <ExpandCollapseAllBar
                                parentElementId={['logs']}
                                requestId={contextId}
                            />
                        </div>
                    </div>
                    <table className={commonStyles.table}>
                        <thead>
                            <tr>
                                <th style={{width: ordinalWidth}}>
                                    <AgentTypeIcon className={styles.logAgentIcon} />#
                                </th>
                                <th style={{width: levelWidth}}>
                                    <Icon shape={undefined} className={styles.logLevelIcon} />Level
                                </th>
                                <th
                                    style={{width: categoryWidth}}
                                    className={classNames(styles.categoryColumn, categoryModifier)}>
                                    Category
                                </th>
                                <th style={{width: messageWidth}}>
                                    <Icon
                                        shape={undefined}
                                        className={styles.logTimeSpanIcon}
                                    />Message
                                </th>
                                <th style={{width: offsetWidth}}>From start</th>
                                <th style={{width: locationWidth}}>Location</th>
                            </tr>
                            <tr>
                                <td
                                    colSpan={5 + colSpanModifier}
                                    className={commonStyles.tableHeadSpacer}
                                />
                            </tr>
                        </thead>
                    </table>
                </div>
                <div className={styles.logViewTableContainer}>
                    <table className={styles.logViewTable}>
                        <thead>
                            <tr>
                                <th style={{width: ordinalWidth}} />
                                <th style={{width: levelWidth}} />
                                <th
                                    style={{width: categoryWidth}}
                                    className={classNames(styles.categoryColumn, categoryModifier)}
                                />
                                <th style={{width: messageWidth}} />
                                <th style={{width: offsetWidth}} />
                                <th style={{width: locationWidth}} />
                            </tr>
                        </thead>
                        <tbody>
                            {templateBatchProcessor(
                                filteredMessages,
                                LoggingView.typesOrder,
                                LoggingView.templates,
                                { contextId, component: this }
                            )}
                            {this.renderNoEvents()}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    private renderNoEvents() {
        const { filteredMessageCount, totalMessageCount } = this.props;

        let result;
        if (totalMessageCount === 0) {
            result = <span className={styles.logMessageNoEvents}>No messages detected.</span>;
        } else if (filteredMessageCount === 0) {
            result = (
                <span className={styles.logMessageNoEvents}>
                    No messages shown. Try changing the filter above.
                </span>
            );
        }

        return result ? <tr><td colSpan={5}>{result}</td></tr> : result;
    }

    private static typesOrder = [
        "Glimpse.Messages.Payloads.Log.CountType",
        "Glimpse.Messages.Payloads.Log.JsonType",
        "Glimpse.Messages.Payloads.Log.XmlType",
        "Glimpse.Messages.Payloads.Log.TableType",
        "Glimpse.Messages.Payloads.Log.TimespanBeginType",
        "Glimpse.Messages.Payloads.Log.TimespanEndType",
        "Glimpse.Messages.Payloads.Log.GroupBeginType",
        "Glimpse.Messages.Payloads.Log.GroupEndType",
        "Glimpse.Messages.Payloads.Log.TokenPrintfType",
        "Glimpse.Messages.Payloads.Log.WriteType"
    ];

    private static layouts = {
        master: function(model: ILoggingMessage, index, props, template) {
            const isExploredCategories = props.component.props.isExploredCategories;
            const category = model.payload.category || '-';

            return (
                <MessageRowTarget ordinal={model.ordinal} elementKey={model.messageId}>
                    <td>
                        <a data-name={model.ordinal.toString()}>
                            {LoggingView.renderValueWithIcon(
                                model.ordinal,
                                <AgentTypeIcon
                                    agentType={model.agent}
                                    className={styles.logAgentIcon}
                                />
                            )}
                        </a>
                    </td>
                    <td className={commonStyles.trimText}>
                        {LoggingView.renderValueWithIcon(
                            LoggingMessageLevel[model.level],
                            <LoggingLevelIcon level={model.level} />
                        )}
                    </td>
                    <td
                        className={classNames(commonStyles.trimText, styles.categoryColumn, {
                            [styles.isVisible]: isExploredCategories
                        })}
                        title={category}>
                        {category}
                    </td>
                    <td className={styles.logContent}>
                        {LoggingView.renderGroupingElements(model)}
                        {template(model, index)}
                    </td>
                    <td className={styles.logDurationColumn}>
                        <TimeDuration duration={model.offset} />
                    </td>
                    <td>
                        {LoggingView.renderLocation(model.types, model)}
                    </td>
                </MessageRowTarget>
            );
        }
    };

    private static timespanTemplate(isStart, model, index, props) {
        return LoggingView.layouts.master(model, index, props, () => {
            return LoggingView.renderValueWithIcon(
                <LoggingTimeSpan message={model} wasStarted={isStart} />,
                <Icon shape="Clock" className={styles.logTimeSpanIcon} />
            );
        });
    }

    private static groupTemplate(isStart, model, index, props) {
        return LoggingView.layouts.master(model, index, props, () => {
            const getLabel = message => {
                return model.types.indexOf("TokenPrintfType") > -1 // Glimpse.Messages.Payloads.Log.TokenPrintfType
                    ? <LoggingStatement
                          content={message}
                          contextId={props.contextId}
                          messageId={model.messageId}
                      />
                    : <span>{message}</span>;
            };

            return LoggingView.renderValueWithIcon(
                <LoggingLabel message={model.payload.message} getLabel={getLabel} />,
                <ExpandCollapseButton
                    elementId={['logs', model.messageId]}
                    expanded={!model.isCollapsed}
                    requestId={props.contextId}
                    title="Group"
                />
            );
        });
    }

    private static templates = {
        ["Glimpse.Messages.Payloads.Log.TimespanBeginType"]: LoggingView.timespanTemplate.bind(
            undefined,
            true
        ),
        ["Glimpse.Messages.Payloads.Log.TimespanEndType"]: LoggingView.timespanTemplate.bind(
            undefined,
            false
        ),
        ["Glimpse.Messages.Payloads.Log.GroupBeginType"]: LoggingView.groupTemplate.bind(
            undefined,
            true
        ),
        ["Glimpse.Messages.Payloads.Log.GroupEndType"]: LoggingView.groupTemplate.bind(
            undefined,
            false
        ),
        ["Glimpse.Messages.Payloads.Log.TableType"]: function(model, index, props) {
            if (!JsonTable.canRenderMessage(model.payload.message)) {
                return LoggingView.templates["JsonType"]( // Glimpse.Messages.Payloads.Log.JsonType
                    model,
                    index,
                    props
                );
            }

            return LoggingView.layouts.master(model, index, props, () => {
                return LoggingView.renderValueWithIcon(
                    <JsonTable
                        className={styles.logContentTable}
                        model={model}
                        isEvenRow={!!(index % 2)}
                    />,
                    <ExpandCollapseButton
                        title="Table"
                        elementId={['logs', model.messageId]}
                        expanded={!model.isCollapsed}
                        requestId={props.contextId}
                    />,
                    styles.logTableStyle
                );
            });
        },
        ["Glimpse.Messages.Payloads.Log.CountType"]: function(model: ILoggingMessage, index, props) {
            return LoggingView.layouts.master(model, index, props, () => {
                return LoggingView.renderValueWithIcon(
                    <span>
                        <LoggingLabel message={model.payload.message} />:
                        {' '}<span className="token tokenInteger">{model.payload.count}</span>
                    </span>
                );
            });
        },
        ["Glimpse.Messages.Payloads.Log.JsonType"]: function(model, index, props) {
            let data = model.payload.message;
            if (model.types.indexOf("JsonType") > -1) { // Glimpse.Messages.Payloads.Log.JsonType
                data = data[0];
            }

            return LoggingView.layouts.master(model, index, props, () => {
                return LoggingView.renderValueWithIcon(
                    <span data-glimpse-object>
                        <JsonTree
                            data={data}
                            elementId={['logs', model.messageId]}
                            requestId={props.contextId}
                        />
                    </span>
                );
            });
        },
        ["Glimpse.Messages.Payloads.Log.XmlType"]: function(model, index, props) {
            let content = model.payload.message;
            if (Array.isArray(content)) {
                content = content[0];
            }

            return LoggingView.layouts.master(model, index, props, () => {
                return LoggingView.renderExpandableText(props.contextId, model.messageId, content);
            });
        },
        ["Glimpse.Messages.Payloads.Log.TokenPrintfType"]: function(model, index, props) {
            return LoggingView.layouts.master(model, index, props, () => {
                let allowExpansion;

                if (Array.isArray(model.payload.message)) {
                    allowExpansion = model.payload.message.every(param => !isObjectLike(param));
                }

                let text = (
                    <LoggingStatement
                        content={model.payload.message}
                        tokenSupport={model.payload.tokenSupport}
                        contextId={props.contextId}
                        messageId={model.messageId}
                    />
                );
                text = LoggingView.appendCallstack(text, model);

                if (allowExpansion) {
                    return LoggingView.renderExpandableText(props.contextId, model.messageId, text);
                } else {
                    return LoggingView.renderValueWithIcon(text);
                }
            });
        },
        ["Glimpse.Messages.Payloads.Log.WriteType"]: function(model, index, props) {
            const message = model.payload.message;
            const type = typeof message;

            // we are attempting to be nice to those who just send `log-write` messages
            if (type === 'object') {
                return LoggingView.templates["JsonType"]( // Glimpse.Messages.Payloads.Log.JsonType
                    model,
                    index,
                    props
                );
            }

            // if not an object the treat as a string
            return LoggingView.layouts.master(model, index, props, () => {
                const text = type === 'string' || message === undefined || message === null // tslint:disable-line:no-null-keyword
                    ? message
                    : String(message);
                return LoggingView.renderExpandableText(props.contextId, model.messageId, text);
            });
        }
    };

    private static renderValueWithIcon(value, icon?, valueClassName?: string) {
        const actualIcon = icon || LoggingView.renderDefaultIcon();

        return (
            <div className={classNames(styles.logIconColumn, valueClassName)}>
                {actualIcon}
                {value}
            </div>
        );
    }

    private static renderExpandableText(contextId, messageId, text) {
        return <ExpandableText elementId={['logs', messageId]} requestId={contextId} text={text} />;
    }

    private static renderDefaultIcon() {
        return <Icon shape={undefined} className={styles.logTimeSpanIcon} />;
    }

    private static renderLocation(types: string[], message: ILoggingMessage) {
        const callStack = includes(types, "CallStackType") // Glimpse.Messages.Payloads.Mixin.CallStackType
            ? (message.payload as any) as Glimpse.Messages.Payloads.Mixin.ICallStack // tslint:disable-line:no-any
            : undefined;
        const topStackFrame = callStack && callStack.frames && callStack.frames.length
            ? callStack.frames[0]
            : undefined;

        return <StackFrame frame={topStackFrame} />;
    }

    private static renderGroupingElements(model: ILoggingMessage) {
        if (model.group) {
            return model.group.map((group, i) => {
                if (!group.isClosed) {
                    return (
                        <div
                            key={i}
                            className={classNames(styles.logGroup, {
                                [styles.logGroupLine]: group.isActive,
                                [styles.logGroupLineEnd]: group.isEnding
                            })}
                        />
                    );
                }
            });
        }
    }

    private static appendCallstack(component, model) {
        if (
            model.types.indexOf('log-display-callstack') > -1 &&
            model.payload.frames &&
            model.payload.frames.length > 0
        ) {
            let callstackData = '';
            for (let i = 0; i < model.payload.frames.length; i++) {
                const currFrame = model.payload.frames[i];
                if (currFrame.functionName) {
                    callstackData += `    at ${currFrame.functionName} (${currFrame.fileName}:${currFrame.lineNumber}:${currFrame.columnNumber})\n`;
                } else {
                    callstackData += `    at ${currFrame.fileName}:${currFrame.lineNumber}:${currFrame.columnNumber}\n`;
                }
            }

            return (
                <div>
                    {component}
                    <div>{callstackData}</div>
                </div>
            );
        }
        return component;
    }
}

function mapStateToProps(state: IStoreState): ILoggingProps {
    const filteredMessages = getVisibleLoggingMessages(state);
    const storeExploredCategories = getExploredCategories(state);
    const currentExploredCategories = getCurrentExploredCategories(state);

    const exploredCategories = {
        ...storeExploredCategories,
        ...currentExploredCategories
    };

    return {
        filteredMessages,
        storeExploredCategories,
        exploredCategories,
        filteredMessageCount: getCountableFilteredMessageCount(state),
        isExploredCategories: Object.keys(exploredCategories).length > 0,
        contextId: getSelectedContextId(state),
        totalMessageCount: getCountableMessageCount(state)
    };
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        saveExploredCategories: categories => {
            dispatch(addExploredCategoryAction({ ...categories }));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoggingView);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/logging/views/Logging.tsx