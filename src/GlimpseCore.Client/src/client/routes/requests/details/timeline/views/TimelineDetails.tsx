import React from 'react'; // tslint:disable-line:no-unused-variable
import classNames from 'classnames';
import { connect } from 'react-redux';

import AgentTypeIcon from 'common/components/AgentTypeIcon';
import { IStoreState } from 'client/IStoreState';
import { formatMilliseconds, TimeDuration } from 'common/components/TimeDuration';
import TimelineActivity from 'common/components/timeline/TimelineActivity';
import TimelineSlownessIcon from 'routes/requests/details/timeline/views/TimelineSlownessIcon';
import {
    TimelineTable,
    ITimelineTableProps,
    ITimelineTableCallbacks,
    getActivityColumnPlaceholder
} from 'common/components/timeline/TimelineTable';
import {
    TimelineEventCategory,
    ITimelineSpan,
    ITimelineEvent,
    AgentType
} from 'routes/requests/details/timeline/TimelineInterfaces';
import {
    getSelectedTimelineEvents,
    getTotalTimelineDuration
} from 'routes/requests/details/timeline/TimelineSelectors';
import { toStringWithFixedPoints } from 'common/util/StringUtilities';
import { getBackgroundStyleForCategory, getBorderStyleForCategory } from './TimelineCommon';
import {
    routeActivityAction,
    highlightOffsetsAction,
    resetHighlightedOffsetsAction
} from 'routes/requests/details/timeline/TimelineActions';

import styles from './TimelineDetails.scss';
import commonStyles from 'common/components/Common.scss';

// tslint:disable-next-line:variable-name
const TimelineActivityBar = (props: { activity: ITimelineSpan; metadata }) => {
    const { activity, metadata } = props;

    return (
        <div
            className={classNames(
                styles.timelineDetailsActivityBar,
                getBackgroundStyleForCategory(activity.category)
            )}>
            {metadata
                ? <div className={styles.timelineDetailsActivityMetadataContainer}>
                      {metadata}
                  </div>
                : undefined}
        </div>
    );
};

// tslint:disable-next-line:variable-name
const TimelineMetadata = (props: { activity: ITimelineSpan; totalDuration: number }) => {
    const { activity, totalDuration } = props;

    const percentageDuration = activity.duration / totalDuration * 100;
    const percentageDurationString = toStringWithFixedPoints(percentageDuration, 1);

    return (
        <div className={styles.timelineDetailsActivityMetadata}>
            <TimeDuration duration={activity.duration} />
            <span className={styles.timelineDetailsActivityMetadataPercentage}>
                ({percentageDurationString}%)
            </span>
        </div>
    );
};

// tslint:disable-next-line:variable-name
const TimelineEvent = (props: { event: ITimelineEvent }) => {
    const { event } = props;
    const categoryText = event.customCategoryDescription || TimelineEventCategory[event.category];
    const title = `Event: ${event.title}\nCategory: ${categoryText}\nExecuted at: ${formatMilliseconds(
        event.offset
    ).toString()}`;

    return (
        <div
            className={classNames(
                styles.timelineDetailsEvent,
                getBorderStyleForCategory(event.category)
            )}
            title={title}
        />
    );
};

interface ITimelineDetailsParams {
    eventIDsToSlowness: { [key: string]: number };
    totalDuration: number;
}

const activityBarFunc = (activity: ITimelineSpan, params: ITimelineDetailsParams, metadata) => {
    return <TimelineActivityBar activity={activity} metadata={metadata} />;
};

const activityFunc = (
    activity: ITimelineSpan,
    minOffset: number,
    maxOffset: number,
    params: ITimelineDetailsParams
) => {
    const metadata = <TimelineMetadata activity={activity} totalDuration={params.totalDuration} />;

    return (
        <TimelineActivity
            activity={activity}
            activityBarFunc={activityBarFunc}
            minOffset={minOffset}
            maxOffset={maxOffset}
            metadata={metadata}
        />
    );
};

const eventFunc = (event: ITimelineEvent) => {
    return <TimelineEvent event={event} />;
};

const indexColumn = {
    headerFunc: () => {
        return (
            <div className={styles.timelineDetailsIndexContainer}>
                {/* Note: We add "empty" icons as spacers for the text to match the rows. */}
                <TimelineSlownessIcon
                    className={styles.timelineDetailsSlownessIcon}
                    slowness={undefined}
                />
                <AgentTypeIcon />
                <span className={styles.timelineDetailsIndexText}>#</span>
            </div>
        );
    },
    valueFunc: (activity: ITimelineSpan, params: ITimelineDetailsParams) => {
        return (
            <div className={styles.timelineDetailsIndexContainer}>
                <TimelineSlownessIcon
                    className={styles.timelineDetailsSlownessIcon}
                    slowness={params.eventIDsToSlowness[activity.eventId]}
                />
                <AgentTypeIcon agentType={activity.source} />
                <span className={styles.timelineDetailsIndexText}>{activity.index}</span>
            </div>
        );
    },
    width: 10
};

const isActivityLinkable = (activity: ITimelineSpan): boolean => {
    switch (activity.category) {
        case TimelineEventCategory.WebService:
            return true;
        case TimelineEventCategory.Data:
            return true;

        case TimelineEventCategory.Request:
            return (
                activity.source === AgentType.Server &&
                activity.rawMessages.length > 0 &&
                'correlationId' in activity.rawMessages[0].payload &&
                'types' in activity.rawMessages[0] &&
                (activity.rawMessages[0].types.indexOf('middleware-start') !== -1 ||
                    activity.rawMessages[0].types.indexOf('middleware-end') !== -1)
            );

        default:
            return false;
    }
};

const eventColumn = {
    headerFunc: () => 'Event',
    valueFunc: (activity: ITimelineSpan) => {
        return (
            <div
                className={classNames(commonStyles.trimText, {
                    [commonStyles.link]: isActivityLinkable(activity)
                })}
                title={activity.title}>
                {activity.title}
            </div>
        );
    },
    width: 28
};
import StackFrame from 'common/components/StackFrame';

const locationColumn = {
    headerFunc: () => 'Location',
    valueFunc: (activity: ITimelineSpan) => {
        const topFrame = activity.frames && activity.frames[0] ? activity.frames[0] : undefined;

        return <StackFrame frame={topFrame} />;
    },
    width: 12
};

const columns = [indexColumn, eventColumn, locationColumn, getActivityColumnPlaceholder()];

function mapStateToProps(
    state: IStoreState,
    props
): Partial<ITimelineTableProps<ITimelineDetailsParams>> {
    const {
        minOffset,
        maxOffset,
        spans,
        pointInTimeEvents,
        eventIDsToSlowness
    } = getSelectedTimelineEvents(state);

    return {
        activityFunc,
        eventFunc,
        columns,
        minOffset,
        maxOffset,
        offsetTicks: 5,
        spans,
        pointInTimeEvents,
        params: {
            eventIDsToSlowness,
            totalDuration: getTotalTimelineDuration(state)
        },
        rowClassName: classNames(styles.timelineDetailsTableRow, commonStyles.tableSelectableRow),
        selectedRowClassName: commonStyles.tableSelectedRow
    };
}

function mapDispatchToProps(dispatch, props): ITimelineTableCallbacks {
    return {
        onSelectActivity: (activity: ITimelineSpan) => {
            if (!isActivityLinkable(activity)) {
                return;
            }

            routeActivityAction(props.requestId, activity)(dispatch);
        },
        onHoverActivity: (span: ITimelineSpan) => {
            dispatch(
                highlightOffsetsAction({
                    minOffset: span.offset,
                    maxOffset: span.offset + span.duration,
                    requestId: props.requestId
                })
            );
        },
        onUnhoverActivity: () => {
            dispatch(resetHighlightedOffsetsAction({ requestId: props.requestId }));
        }
    };
}

const TimelineDetails = connect(mapStateToProps, mapDispatchToProps)(TimelineTable); // tslint:disable-line:variable-name

export default TimelineDetails;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/views/TimelineDetails.tsx