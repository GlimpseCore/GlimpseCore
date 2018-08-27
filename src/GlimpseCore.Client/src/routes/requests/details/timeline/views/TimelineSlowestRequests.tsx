import React from 'react'; // tslint:disable-line:no-unused-variable
import { connect } from 'react-redux';
import classNames from 'classnames';
import { ISlowTimelineSpan } from '../TimelineInterfaces';
import { IStoreState } from 'client/IStoreState';
import { getSlowestTimelineEvents } from '../TimelineSelectors';
import Icon from 'common/components/Icon';
import { TimeDuration, TimeDurationFormat } from 'common/components/TimeDuration';
import commonStyles from 'common/components/Common.scss';
import styles from './TimelineSlowestRequests.scss';
import { getColorStyleForCategory } from './TimelineCommon';
import MessageRowLink from 'common/components/MessageRowLink';
import TimelineSlownessIcon from './TimelineSlownessIcon';

// tslint:disable-next-line:variable-name
const TimelineSlowRequestView = (props: { span: ISlowTimelineSpan; slowness: number }) => {
    const { span, slowness } = props;
    if (span) {
        let eventName;
        if (span.isVisible) {
            eventName = (
                <MessageRowLink
                    ordinal={span.ordinal}
                    title={`Jump to event ${span.index}`}
                    className={classNames(commonStyles.trimText, commonStyles.link)}>
                    {span.title}
                </MessageRowLink>
            );
        } else {
            eventName = (
                <div
                    className={classNames(
                        commonStyles.trimText,
                        styles.timelineSlowRequestEventNoLink
                    )}
                    title={span.title}>
                    {span.title}
                </div>
            );
        }
        return (
            <div className={styles.timelineSlowRequestContainer}>
                <TimeDuration
                    duration={span.duration}
                    format={TimeDurationFormat.WholeMillesecondsFractionalSeconds}
                    valueClassName={styles.timelineSlowRequestDuration}
                    unitClassName={styles.timelineSlowRequestDurationUnits}
                />
                <div className={styles.timelineSlowRequestRow}>
                    <TimelineSlownessIcon
                        className={styles.timelineSlowRequestRowIcon}
                        slowness={slowness}
                    />
                    <div>#{span.index}</div>
                </div>
                <div className={styles.timelineSlowRequestRow}>
                    <Icon
                        shape="CategorySquare"
                        className={classNames(
                            styles.timelineSlowRequestRowIcon,
                            getColorStyleForCategory(span.category)
                        )}
                    />
                    {eventName}
                </div>
            </div>
        );
    } else {
        return (
            <div className={styles.timelineSlowRequestContainer}>
                <div>
                    <span className={styles.timelineSlowRequestNoDuration}>N/A</span>
                </div>
                <div className={styles.timelineSlowRequestRow}>
                    <div>&nbsp;</div>
                </div>
                <div className={styles.timelineSlowRequestRow}>
                    <Icon
                        shape="Information"
                        className={classNames(
                            styles.timelineSlowRequestRowIcon,
                            styles.timelineSlowRequestIconInformation
                        )}
                    />
                    <div className={styles.timelineSlowRequestNoEvent}>No Event Detected</div>
                </div>
            </div>
        );
    }
};

interface ITimelineSlowestRequestProps {
    className?: string;
    spans: ISlowTimelineSpan[];
}

// tslint:disable-next-line:variable-name
const TimelineSlowestRequestsView = (props: ITimelineSlowestRequestProps) => {
    const { spans, className } = props;

    // account for styling when some spans have equal durations.
    const span0Slowness = 1;
    let span1Slowness = 2;
    let span2Slowness = 3;
    if (spans[0] && spans[1] && spans[0].duration === spans[1].duration) {
        span1Slowness = span0Slowness;
    }
    if (spans[1] && spans[2] && spans[1].duration === spans[2].duration) {
        span2Slowness = span1Slowness;
    }

    return (
        <div>
            <div className={styles.timelineSlowestRequestsHeader}>
                <span>Three slowest events</span>
            </div>

            <div className={classNames(className, styles.timelineSlowestRequestsContainer)}>
                <TimelineSlowRequestView span={spans[0]} slowness={span0Slowness} />
                <TimelineSlowRequestView span={spans[1]} slowness={span1Slowness} />
                <TimelineSlowRequestView span={spans[2]} slowness={span2Slowness} />
            </div>
        </div>
    );
};

function mapStateToProps(state: IStoreState, props): ITimelineSlowestRequestProps {
    return {
        className: props.className,
        spans: getSlowestTimelineEvents(state)
    };
}

// tslint:disable-next-line:variable-name
const TimelineSlowestRequests = connect(mapStateToProps)(TimelineSlowestRequestsView);

export default TimelineSlowestRequests;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/views/TimelineSlowestRequests.tsx