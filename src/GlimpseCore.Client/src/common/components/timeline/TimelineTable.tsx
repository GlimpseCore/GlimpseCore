import range from 'lodash/range';
import classNames from 'classnames';
import React from 'react';

import MessageRowTarget from '@common/components/MessageRowTarget';
import { TimeDuration, TimeDurationFormat } from '@common/components/TimeDuration';
import { ITimelineComponentEvent, ITimelineComponentSpan } from './TimelineCommonInterfaces';

import styles from './TimelineTable.scss';
import commonStyles from '@common/components/Common.scss';

/**
 * An individual data column within the timeline table.
 */
export interface ITimelineTableColumn<T> {
    /**
     * (Optional) Name of the column.
     */
    name?: string;

    /**
     * (Optional) The CSS class name applied to the column's <th> element.
     */
    headerClassName?: string;

    /**
     * A function that generates the content for the column's header.
     */
    headerFunc: (props: ITimelineTableProps<T>) => string | JSX.Element;

    /**
     * (Optional) The CSS class name applied to the column's <td> element.
     */
    valueClassName?: string;

    /**
     * A function that generates the content for the column at the activity's row.
     */
    valueFunc: (activity: ITimelineComponentSpan, params: T, props?) => string | JSX.Element;

    /**
     * The percentage width (0-100) of the column (with any remainder given to the activity bar).
     */
    width: number;
}

/**
 * The properties for the TimelineTable control.
 */
export interface ITimelineTableProps<T> {
    /**
     * A function that generates the content (e.g. activity bar) for an activity.
     *
     * Notes:
     *
     *  - The function is generally expected to return an TimelineActivity instance but can return arbitrary UI, e.g. for error conditions.
     */
    activityFunc: (
        activity: ITimelineComponentSpan,
        minOffset: number,
        maxOffset: number,
        params: T
    ) => JSX.Element;

    /**
     * The CSS class name applied to the root element of the control.
     */
    className?: string;

    /**
     * The data columns for the table.
     */
    columns: ITimelineTableColumn<T>[];

    /**
     * (Optional) A function that generates the content (i.e. line) for a point-in-time event.
     */
    eventFunc: (event: ITimelineComponentEvent, params: T) => JSX.Element;

    /**
     * The maximum offset visible within the table.
     */
    maxOffset: number;

    /**
     * The minimum offset visible within the table.
     */
    minOffset: number;

    /**
     * The number of "tick marks" (i.e. time intervals) visible within the table.
     */
    offsetTicks: number;

    /**
     * (Optional) Parameters passed to any content generator function.
     */
    params: T;

    /**
     * (Optional) The set of point-in-time events to display within the table.
     */
    pointInTimeEvents?: ITimelineComponentEvent[];

    /**
     * (Optional) The CSS class name applied to each <tr> element within the table.
     */
    rowClassName?: string;

    /**
     * (Optional) The currently selected activity (if any).
     */
    selectedActivity?: ITimelineComponentSpan;

    /**
     * (Optional) The CSS class name applied to the <tr> element of the selected activity (if any).
     */
    selectedRowClassName: string;

    /**
     * The set of activities to display within the table.
     */
    spans: ITimelineComponentSpan[];

    /**
     * Whether the first activity should be auto-selected, if no activities are selected.
     */
    shouldAutoSelectFirstActivity?: boolean;

    /**
     * The currently selected request ID (context ID)
     */
    requestId: string;
}

export interface ITimelineTableCallbacks {
    /**
     * (Optional) The function called when the user selects an activity (i.e. clicks a table row).
     */
    onSelectActivity: (activity: ITimelineComponentSpan, requestId?: string) => void;
    onHoverActivity?: (activity: ITimelineComponentSpan) => void;
    onUnhoverActivity?: (activity: ITimelineComponentSpan) => void;
}

/**
 * An individual row within the timeline table.
 */
interface ITimelineTableActivityRowProps<T> {
    /**
     * The activity associated with the row.
     */
    activity: ITimelineComponentSpan;

    /**
     * A function that generates the content (i.e. bar) for an activity.
     */
    activityFunc: (
        activity: ITimelineComponentSpan,
        minOffset: number,
        maxOffset: number,
        params: T
    ) => JSX.Element;

    /**
     * The data columns for the table.
     */
    columns: ITimelineTableColumn<T>[];

    /**
     * The maximum offset visible within the table.
     */
    maxOffset: number;

    /**
     * The minimum offset visible within the table.
     */
    minOffset: number;

    /**
     * The number of "tick marks" (i.e. time intervals) visible within the table.
     */
    offsetTicks: number;

    /**
     * (Optional) Parameters passed to any content generator function.
     */
    params: T;

    /**
     * (Optional) The CSS class name applied to each <tr> element within the table.
     */
    rowClassName?: string;

    /**
     * (Optional) The currently selected activity (if any).
     */
    selectedActivity?: ITimelineComponentSpan;

    /**
     * (Optional) The CSS class name applied to the <tr> element of the selected activity (if any).
     */
    selectedRowClassName: string;

    /**
     * (Optional) Request context id.
     */
    requestId?: string;
}

interface ITimelineTableActivityRowCallbacks {
    onSelectActivity?: (activity: ITimelineComponentSpan, requestId?: string) => void;
    onHoverActivity?: (activity: ITimelineComponentSpan) => void;
    onUnhoverActivity?: (activity: ITimelineComponentSpan) => void;
}

/**
 * Generate `activity` column placeholder.
 */
export const getActivityColumnPlaceholder = (): ITimelineTableColumn<{}> => {
    return {
        name: 'activity',
        headerFunc: props => {
            const { minOffset, maxOffset, offsetTicks } = props;
            const tickValue = (maxOffset - minOffset) / offsetTicks;

            return (
                <div className={styles.timelineTableActivityHeaderIntervals}>
                    {range(1, offsetTicks + 1).map(index =>
                        <div className={styles.timelineTableIntervalCell} key={`interval-${index}`}>
                            <TimeDuration
                                duration={minOffset + index * tickValue}
                                format={TimeDurationFormat.WholeMillesecondsFractionalSeconds}
                            />
                        </div>
                    )}
                </div>
            );
        },
        valueFunc: (activity, params, props) => {
            const { activityFunc, minOffset, maxOffset } = props;

            return (
                <div className={styles.timelineTableActivityBarCellActivityLayer}>
                    {activityFunc(activity, minOffset, maxOffset, params)}
                </div>
            );
        },
        width: 0,
        headerClassName: styles.timelineTableActivityHeader,
        valueClassName: styles.timelineTableActivityBarCell
    };
};

export class TimelineTable<T> extends React.Component<
    ITimelineTableProps<T> & ITimelineTableCallbacks,
    {}
> {
    // tslint:disable-next-line:variable-name
    private TimelineDetailsActivityRow = class TimelineTableActivityRow extends React.Component<
        ITimelineTableActivityRowProps<T> & ITimelineTableActivityRowCallbacks,
        {}
    > {
        public static createBlankRow<T>(columns: ITimelineTableColumn<T>[], offsetTicks: number) {
            return (
                <tr key="blank">
                    {columns.map((column, index) =>
                        <td className={classNames(column.valueClassName)} key={index.toString()}>
                            &nbsp;
                        </td>
                    )}
                    <td className={styles.timelineTableActivityBarCell} />
                </tr>
            );
        }

        private onClick = e => {
            const { activity, onSelectActivity, requestId } = this.props;

            if (onSelectActivity) {
                onSelectActivity(activity, requestId);
            }
        };

        private onHover = e => {
            const { activity, onHoverActivity } = this.props;

            if (onHoverActivity) {
                onHoverActivity(activity);
            }
        };

        private onUnhover = e => {
            const { activity, onUnhoverActivity } = this.props;

            if (onUnhoverActivity) {
                onUnhoverActivity(activity);
            }
        };

        public render() {
            const {
                activity,
                columns,
                params,
                rowClassName,
                selectedActivity,
                selectedRowClassName
            } = this.props;

            const isSelected = selectedActivity && selectedActivity.eventId === activity.eventId;

            return (
                <MessageRowTarget
                    elementKey={activity.eventId}
                    ordinal={activity.ordinal}
                    onClick={this.onClick}
                    onMouseEnter={this.onHover}
                    onMouseLeave={this.onUnhover}
                    className={classNames(rowClassName, { [selectedRowClassName]: isSelected })}
                    isSelected={isSelected}>
                    {this.renderItems(columns, activity, params)}
                </MessageRowTarget>
            );
        }

        private renderItems(
            columns: ITimelineTableColumn<T>[],
            activity: ITimelineComponentSpan,
            params: T
        ) {
            return columns.map((column, index) => {
                return (
                    <td className={column.valueClassName} key={index.toString()}>
                        {column.valueFunc(activity, params, this.props)}
                    </td>
                );
            });
        }
    };

    constructor(props: ITimelineTableProps<T> & ITimelineTableCallbacks) {
        super(props);
        this.validateProps();
    }

    private validateProps() {
        if (!this.props) {
            throw new Error('TimelineDetailsView requires properties be set.');
        }

        if (this.props.maxOffset <= this.props.minOffset) {
            throw new Error('maxOffset must be greater than minOffset.');
        }

        if (this.props.offsetTicks <= 0) {
            throw new Error('offsetTicks must be greater than 0.');
        }
    }

    public componentDidUpdate() {
        const {
            selectedActivity,
            onSelectActivity,
            shouldAutoSelectFirstActivity,
            spans,
            requestId
        } = this.props;
        this.validateProps();

        if (shouldAutoSelectFirstActivity && !selectedActivity && spans.length) {
            onSelectActivity(spans[0], requestId);
        }
    }

    public render() {
        const { className, columns, eventFunc, offsetTicks, pointInTimeEvents } = this.props;
        const { activityWidth, activityRightShift } = this.getActivityDimensions(columns);

        return (
            <div className={classNames(styles.timelineTable, className)}>
                <div className={styles.timelineTableHeaderContainer}>
                    <div className={styles.timelineTableHeaderTable}>
                        <table className={styles.timelineTableTable}>
                            <thead>
                                <tr>
                                    {this.renderTableHead(columns, activityWidth)}
                                </tr>
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className={commonStyles.tableHeadSpacer}
                                    />
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div className={styles.timelineTableScrollGutter} />
                </div>
                <div className={styles.timelineTableTableContainer}>
                    <div className={styles.timelineTableScrollContainer}>
                        <div className={styles.timelineTableEventsContainer}>
                            <div
                                className={styles.timelineTableIntervalContainer}
                                style={{ width: activityWidth, right: activityRightShift }}>
                                {range(1, offsetTicks + 1).map(index =>
                                    <div
                                        className={styles.timelineTableInterval}
                                        key={index.toString()}
                                    />
                                )}
                            </div>
                            <table className={styles.timelineTableTable}>
                                <thead>
                                    <tr>
                                        {this.renderTableBodyHead(columns, activityWidth)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.renderActivities()}
                                </tbody>
                            </table>
                            {pointInTimeEvents && pointInTimeEvents.length && eventFunc
                                ? <div
                                      className={styles.timelineTableEvents}
                                      style={{ width: activityWidth, right: activityRightShift }}>
                                      {pointInTimeEvents.map(event => this.renderEvent(event))}
                                  </div>
                                : undefined}
                        </div>
                        <div className={styles.timelineTableScrollGutter} />
                    </div>
                </div>
            </div>
        );
    }

    private getActivityDimensions(columns: ITimelineTableColumn<T>[]) {
        let isActivity = false;
        let right = 0;
        let totalColumnWidth = 0;
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i] as ITimelineTableColumn<T>;

            // add width fo all columns except `activity`
            if (column.name !== 'activity') {
                totalColumnWidth += column.width;
                // rise `isActivity` flag to show that we have passed
                // the activity column (for right offset calculation)
            } else {
                isActivity = true;
                continue;
            }
            // add all width of the columns that reside after `activity`
            if (isActivity) {
                right += column.width;
            }
        }

        return {
            activityRightShift: `${right}%`,
            activityWidth: `${100 - totalColumnWidth}%`
        };
    }

    private renderTableHead(columns: ITimelineTableColumn<T>[], activityWidth: string) {
        return columns.map((column, index) => {
            return (
                <th
                    className={classNames(column.headerClassName)}
                    key={`column-${index}`}
                    // @ts-ignore width is fine for th
                    width={`${column.width}%`}>
                    {column.headerFunc(this.props)}
                </th>
            );
        });
    }

    private renderTableBodyHead(columns: ITimelineTableColumn<T>[], activityWidth: string) {
        return columns.map((column, index) => {
            return (
                <th
                    className={column.headerClassName}
                    key={`column-${index}`}
                    // @ts-ignore width is fine for th
                    width={`${column.width}%`}
                />
            );
        });
    }

    private renderActivities() {
        const {
            activityFunc,
            columns,
            eventFunc,
            spans,
            minOffset,
            maxOffset,
            offsetTicks,
            params,
            rowClassName,
            selectedActivity,
            selectedRowClassName,
            onSelectActivity,
            onHoverActivity,
            onUnhoverActivity,
            requestId
        } = this.props;

        if (spans.length > 0) {
            return spans.map(activity =>
                <this.TimelineDetailsActivityRow
                    key={activity.eventId}
                    activity={activity}
                    activityFunc={activityFunc}
                    columns={columns}
                    minOffset={minOffset}
                    maxOffset={maxOffset}
                    offsetTicks={offsetTicks}
                    params={params}
                    rowClassName={rowClassName}
                    selectedActivity={selectedActivity}
                    selectedRowClassName={selectedRowClassName}
                    onSelectActivity={onSelectActivity}
                    onHoverActivity={onHoverActivity}
                    onUnhoverActivity={onUnhoverActivity}
                    requestId={requestId}
                />
            );
        } else if (eventFunc) {
            // Show a blank row if there *might* be events (but perhaps are just filtered out)...
            return [this.TimelineDetailsActivityRow.createBlankRow(columns, offsetTicks)];
        } else {
            // If there are no activities and no possibility of events, show an empty table...
            return [];
        }
    }

    private renderEvent(event: ITimelineComponentEvent) {
        const { eventFunc, minOffset, maxOffset, params } = this.props;

        const effectiveOffset = Math.max(minOffset, Math.min(event.offset, maxOffset));
        const totalDuration = maxOffset - minOffset;
        const midOffset = minOffset + totalDuration / 2;

        const containerStyle: React.CSSProperties = {
            display: 'flex',
            pointerEvents: 'auto',
            position: 'absolute',
            top: 0,
            bottom: 0
        };

        // NOTE: To ensure visibility, we layout the event from the left or
        //       right depending on which "half" of the overview it will reside.

        if (event.offset <= midOffset) {
            const proportion = (effectiveOffset - minOffset) / totalDuration;
            const left = `${proportion * 100}%`;

            containerStyle.left = left;
        } else {
            const proportion = 1 - (effectiveOffset - minOffset) / totalDuration;
            const right = `${proportion * 100}%`;

            containerStyle.right = right;
        }

        return (
            <div key={event.eventId} style={containerStyle}>
                {eventFunc(event, params)}
            </div>
        );
    }
}

export default TimelineTable;



// WEBPACK FOOTER //
// ./src/client/common/components/timeline/TimelineTable.tsx