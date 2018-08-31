import React from 'react';
import { connect } from 'react-redux';

import TimelineDetails from './TimelineDetails';
import TimelineOverview from './TimelineOverview';
import TimelineSlowestRequests from './TimelineSlowestRequests';
import TimelineFilterBarContainer from './TimelineFilterBar';
import styles from './Timeline.scss';
import commonStyles from '@common/components/Common.scss';
import { getTimelineEvents, getSelectedTimelineEvents } from '../TimelineSelectors';
import { IStoreState } from '@client/IStoreState';
import { getSelectedContextId } from '@routes/requests/RequestsSelector';

export interface ITimelineProps {
    totalEventCount: number;
    displayedEventCount: number;
    requestId: string;
}

export class Timeline extends React.Component<ITimelineProps, {}> {
    public render() {
        const { requestId } = this.props;

        return (
            <div className={styles.timeline}>
                <div className={commonStyles.tabViewHeader}>
                    <h3 className={commonStyles.detailTitle}>{this.getHeaderText()}</h3>
                    <div className={commonStyles.tabViewFilterHeader}>
                        <TimelineFilterBarContainer />
                    </div>
                </div>
                <div className={styles.timelineScrollingPanel}>
                    <TimelineSlowestRequests />
                    <TimelineOverview className={styles.timelineOverview} />
                    <TimelineDetails requestId={requestId} className={styles.timelineDetails} />
                </div>
            </div>
        );
    }

    private getHeaderText() {
        const { totalEventCount, displayedEventCount } = this.props;
        const events = totalEventCount === 1 ? 'event' : 'events';
        if (totalEventCount === displayedEventCount) {
            return `${totalEventCount} ${events}`;
        } else {
            return `${displayedEventCount} of ${totalEventCount} ${events}`;
        }
    }
}

function mapStateToProps(state: IStoreState): ITimelineProps {
    const allEvents = getTimelineEvents(state);
    const selectedEvents = getSelectedTimelineEvents(state);
    const requestId = getSelectedContextId(state);

    return {
        requestId,
        totalEventCount: allEvents.spans.length + allEvents.pointInTimeEvents.length,
        displayedEventCount: selectedEvents.spans.length + selectedEvents.pointInTimeEvents.length
    };
}

export default connect(mapStateToProps)(Timeline);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/views/Timeline.tsx