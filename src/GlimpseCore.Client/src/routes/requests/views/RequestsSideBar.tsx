import * as Glimpse from '@glimpse/glimpse-definitions';
import React from 'react';
import { connect } from 'react-redux';

import { getSingleMessageByType } from '@routes/requests/RequestsSelector';
import { IRequest } from '../RequestsInterfaces';
import { IRequestFilterDetails } from '../RequestsFilterInterfaces';
import { clearAllAction, selectRequestPreserveFollowAction } from '../RequestsActions';

import styles from './RequestsSideBar.scss';
import SideBar from '@common/components/SideBar';
import SideBarSection from '@common/components/SideBarSection';
import DataLoadingTimer from '@common/components/DataLoadingTimer';
import RequestsSideBarRequest from './RequestsSideBarRequest';

// TODO: this state should not be stored here. Need to find a better
//       place for this. That can happen when follow logic is pulled
//       out of this component.
const followLoadTime = new Date().getTime();
let followLastBlacklistedRequestId;

export interface IRequestsSideBarProps {
    /**
     * Detials of the current filter that is in place
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
}

export interface IRequestsSideBarCallbacks {
    /**
     * Callback that selects a sepecic request
     */
    routeToRequest: (requestId: string) => void;

    /**
     * Callback to clear all requests
     */
    clearAll: () => void;
}

function renderRequests(listing: IRequest[], selectedRequestId: string): JSX.Element[] {
    return listing
        .map(request =>
            <RequestsSideBarRequest
                selectedRequestId={selectedRequestId}
                request={request}
                key={request.id}
            />
        )
        .reverse();
}

function filterTextCount(totalCount: number, filteredCount: number): string | number {
    return totalCount === filteredCount ? totalCount : `${filteredCount} of ${totalCount}`;
}

export class RequestsSideBar extends React.Component<
    IRequestsSideBarProps & IRequestsSideBarCallbacks,
    {}
> {
    public componentWillMount() {
        this.checkIfDefaultSelectionNeedsToOccur();
    }

    public componentDidUpdate() {
        this.checkIfDefaultSelectionNeedsToOccur();
    }

    public render() {
        const { requestFilterDetails, selectedRequestId, filterMode } = this.props;
        const { listing, totalCount, filteredCount } = requestFilterDetails;
        const hasRequestsData = filteredCount > 0;

        return (
            <SideBar
                title={`Requests (${filterTextCount(totalCount, filteredCount)})`}
                rightButtonTitle="Clear all"
                rightButtonOnClick={this.props.clearAll}>
                <SideBarSection
                    title="History"
                    requestFilterDetails={requestFilterDetails}
                    filterMode={filterMode}>
                    <div className={styles.historyContainer}>
                        <DataLoadingTimer
                            className={styles.history}
                            isDataLoaded={hasRequestsData}
                            getEmptyStatusBlock={this.renderEmpty}
                            getLoadingStatusBlock={this.renderLoading}>
                            {renderRequests(listing, selectedRequestId)}
                        </DataLoadingTimer>
                    </div>
                </SideBarSection>
            </SideBar>
        );
    }

    private renderEmpty = (): JSX.Element => {
        return RequestsSideBar.renderText('No request detected.');
    };

    private renderLoading = (): JSX.Element => {
        return RequestsSideBar.renderText('Loading...');
    };

    private static renderText(text: string): JSX.Element {
        return <div className={styles.text}>{text}</div>;
    }

    private checkIfDefaultSelectionNeedsToOccur() {
        // TODO: We really need to find a better way of doing this. We
        //       should have an event that fires when new requests are
        //       detected, but we don't really have a good place for it.
        // NOTE: Major assumption made here about the order of the request
        //       listing. That said, it should be fine since the contract
        //       is bound to that order.
        const { selectedRequestId, requestFilterDetails, routeToRequest, followMode } = this.props;

        // If a request is not selected because it is missing from the
        // URL, then we route to the newest request as soon as the
        // requests are available
        if (requestFilterDetails.listing.length && !selectedRequestId) {
            const request = requestFilterDetails.listing[requestFilterDetails.listing.length - 1];
            routeToRequest(request.id);
        } else if (followMode && requestFilterDetails.listing.length > 0) {
            let newSelectedRequestId: string;

            if (new Date().getTime() - followLoadTime < 5000) {
                // during the follow blackout period, record the id of the
                // newest request so that we can short circuit the follow
                // "finder" when we hit that request
                followLastBlacklistedRequestId =
                    requestFilterDetails.listing[requestFilterDetails.listing.length - 1].id;
            } else {
                // if we are in follow mode and we have requests
                for (let i = requestFilterDetails.listing.length - 1; i > -1; i--) {
                    // stop if we have hit the currently selected request or if
                    // we have found the short circuit request
                    const request = requestFilterDetails.listing[i];
                    if (
                        request.id === selectedRequestId ||
                        request.id === followLastBlacklistedRequestId
                    ) {
                        break;
                    } else if (request.mediaType.follow) {
                        // if the request is followable and we are allowed to follow
                        // if request has navigation timing data, follow it
                        const browserNavigationTiming = getSingleMessageByType<
                            Glimpse.Messages.Payloads.Browser.INavigationTiming
                        >(
                            request.context.byType,
                            Glimpse.Messages.Payloads.Browser.NavigationTimingType
                        );
                        if (browserNavigationTiming) {
                            newSelectedRequestId = request.id;
                            break;
                        }
                    }
                }
            }

            // if we have a request to follow, redirect to it.
            if (newSelectedRequestId) {
                routeToRequest(newSelectedRequestId);
            }
        }
    }
}

function mapDispatchToProps(dispatch): IRequestsSideBarCallbacks {
    return {
        routeToRequest: (requestId: string) => {
            dispatch(selectRequestPreserveFollowAction(requestId));
        },
        clearAll: () => {
            dispatch(clearAllAction());
        }
    };
}

export default connect(undefined, mapDispatchToProps)(RequestsSideBar) as React.ComponentClass<
    IRequestsSideBarProps
>;



// WEBPACK FOOTER //
// ./src/client/routes/requests/views/RequestsSideBar.tsx