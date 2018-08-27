import React, { ReactNode } from 'react';
import { connect } from 'react-redux';

import {
    SIDEBAR_MAX_WIDTH,
    SIDEBAR_THRESHOLD,
    REQUESTS_SIDEBAR_RESIZER_ID
} from '../RequestsResizeConstants';
import { IRequestFilterDetails } from '../RequestsFilterInterfaces';
import { IStoreState } from 'client/IStoreState';
import { getFollowMode, getFilterMode } from '../RequestsSelector';
import { getFilteredRequests } from '../RequestsFilterSelectors';
import { Resize } from 'common/components/resize/Resize';

import styles from './Requests.scss';
import RequestsSideBar from './RequestsSideBar';
import RequestsStatusBlock from '../components/RequestsStatusBlock';
import NotificationPanel from '../components/NotificationPanel';

export interface IRequestsProps {
    /**
     * Details of the current filter that is in place
     */
    requestFilterDetails: IRequestFilterDetails;

    /**
     * Id of the currently selected request
     */
    selectedRequestId: string;

    /**
     * Indicates if follow mode is enabled or not
     */
    followMode: boolean;

    /**
     * Indicates if filter mode is enabled or not
     */
    filterMode: boolean;

    /**
     * Child component that react router wants to render.
     */
    children?: ReactNode[];
}

export interface IRequestsCallbacks {
    saveSidebarWidth: (payload) => void;
    saveOpenState: (payload) => void;
}

export class Requests extends React.Component<IRequestsProps & IRequestsCallbacks, {}> {
    public render() {
        const {
            requestFilterDetails,
            selectedRequestId,
            followMode,
            filterMode,
            children
        } = this.props;

        return (
            <div className={styles.requests}>
                <Resize
                    id={REQUESTS_SIDEBAR_RESIZER_ID}
                    direction="x"
                    isPadding={false}
                    initialSize={250}
                    initialIsOpen={true}
                    minSize={0}
                    maxSize={SIDEBAR_MAX_WIDTH}
                    threshold={SIDEBAR_THRESHOLD}
                    className={styles.sidebar}
                    gripClassName={styles.grip}>
                    <div className={styles.sidebarInner}>
                        <RequestsSideBar
                            requestFilterDetails={requestFilterDetails}
                            selectedRequestId={selectedRequestId}
                            followMode={followMode}
                            filterMode={filterMode}
                        />
                        <NotificationPanel />
                    </div>
                </Resize>
                <RequestsStatusBlock
                    className={styles.detail}
                    selectedRequestId={selectedRequestId}
                    requestFilterDetails={requestFilterDetails}
                    isRequestsDataPresent={
                        !!selectedRequestId || requestFilterDetails.filteredCount > 0
                    }
                    notFoundText="No request is selected. Try selecting a request.">
                    {children}
                </RequestsStatusBlock>
            </div>
        );
    }
}

export interface IConnectedRequestsProps {}

export function mapStateToProps(state: IStoreState): IRequestsProps {
    const { selectedContextId } = state.session.messages;

    const requestFilterDetails = getFilteredRequests(state);
    const followMode = getFollowMode(state);
    const filterMode = getFilterMode(state);

    return {
        requestFilterDetails,
        selectedRequestId: selectedContextId,
        followMode,
        filterMode
    };
}

export default connect(mapStateToProps)(Requests) as React.ComponentClass<
    IConnectedRequestsProps
>;



// WEBPACK FOOTER //
// ./src/client/routes/requests/views/Requests.tsx