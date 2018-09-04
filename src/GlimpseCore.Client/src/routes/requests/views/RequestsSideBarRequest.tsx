import * as Glimpse from '@_glimpse/glimpse-definitions';
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { getTime } from '@common/util/DateTimeUtilities';
import { IStoreState } from '@client/IStoreState';
import { IRequest } from '@routes/requests/RequestsInterfaces';
import { getValueAtKeyCaseInsensitive } from '@common/util/ObjectUtilities';
import { selectRequestAction } from '@routes/requests/RequestsActions';
import { getSingleMessageByType } from '@client/routes/requests/RequestsSelector';

import styles from './RequestsSideBarRequest.scss';
import commonStyles from '@common/components/Common.scss';
import RouteButton from '@common/components/RouteButton';
import TimeDuration from '@common/components/TimeDuration';
import StatusLabel from '@common/components/StatusLabel';
import UrlText from '@common/components/UrlText';
import { ClientLabel } from '@common/components/ClientLabel';
import { calculateDuration } from '@client/routes/requests/details/RequestsDetailsSelector';

export interface IRequestsSideBarRequestProps {
    isSelected: boolean;
    url: string;
    protocol: string;
    method: string;
    statusCode: number;
    statusMessage: string;
    duration: number;
    startTime: string;
    id: string;
    to: string;
    userAgent: string;
}

export interface IRequestsSideBarRequestCallbacks {
    /**
     * Callback for selecting a request
     */
    selectRequest: (requestId: string) => void;
}

export class RequestsSideBarRequest extends React.Component<
    IRequestsSideBarRequestProps &
        IRequestsSideBarRequestCallbacks &
        IConnectedRequestsSideBarRequestProps,
    {}
> {
    public shouldComponentUpdate(nextProps: IRequestsSideBarRequestProps) {
        return (
            nextProps.isSelected !== this.props.isSelected ||
            nextProps.duration !== this.props.duration
        );
    }

    public render() {
        const {
            isSelected,
            method,
            startTime,
            statusCode,
            statusMessage,
            protocol,
            url,
            duration,
            userAgent,
            to
        } = this.props;

        return (
            <RouteButton
                activeClassName={styles.requestButtonActive}
                className={styles.requestButton}
                isActive={isSelected}
                onClick={this.onClick}
                to={to}>
                <div className={styles.requestContainer}>
                    <div className={classNames(styles.requestSummaryLine)}>
                        <div className={commonStyles.trimText}>
                            <UrlText suppressColor={isSelected} url={url} protocol={protocol} />
                        </div>
                        <div className={commonStyles.noWrapText}>{startTime}</div>
                    </div>
                    <div className={classNames(styles.requestDetailLine)}>
                        <div className={styles.requestStatusContainer}>
                            <ClientLabel
                                userAgent={userAgent}
                                className={styles.requestClientIcon}
                                showIconOnly={true}
                            />
                            <span>{method}</span>
                            {' '}
                            <StatusLabel
                                className={styles.statusLabel}
                                statusCode={statusCode}
                                statusMessage={statusMessage}
                            />
                        </div>
                        <div className={styles.duration}>
                            <TimeDuration duration={duration} />
                        </div>
                    </div>
                </div>
            </RouteButton>
        );
    }

    private onClick = (e) => {
        this.props.selectRequest(this.props.id);
    }
}

export interface IConnectedRequestsSideBarRequestProps {
    /**
     * Request that is the current target.
     */
    request: IRequest;

    /**
     * Id of the currently selected request
     */
    selectedRequestId: string;
}

function mapStateToProps(
    state: IStoreState,
    ownProps: IConnectedRequestsSideBarRequestProps
): IRequestsSideBarRequestProps {
    const { request, selectedRequestId } = ownProps;
    const { webRequest, webResponse, id } = request;

    const browserNavigationTimingMessage = getSingleMessageByType<
        Glimpse.Messages.Payloads.Browser.INavigationTiming
    >(request.context.byType, Glimpse.Messages.Payloads.Browser.NavigationTimingType);
    const browserNavigationTiming =
        browserNavigationTimingMessage && browserNavigationTimingMessage.payload;

    const userAgent = getValueAtKeyCaseInsensitive(webRequest.headers, 'User-Agent');
    const duration = calculateDuration(webResponse, browserNavigationTiming);

    return {
        isSelected: id === selectedRequestId,
        url: webRequest.url,
        protocol: webRequest.protocol.identifier,
        method: webRequest.method,
        statusCode: webResponse.statusCode,
        statusMessage: webResponse.statusMessage,
        startTime: getTime(webRequest.startTime),
        duration,
        id,
        userAgent,
        to: `/requests/${id}`
    };
}

function mapDispatchToProps(dispatch): IRequestsSideBarRequestCallbacks {
    return {
        selectRequest: (requestId: string) => {
            dispatch(selectRequestAction(requestId));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    RequestsSideBarRequest
) as React.ComponentClass<IConnectedRequestsSideBarRequestProps>;



// WEBPACK FOOTER //
// ./src/client/routes/requests/views/RequestsSideBarRequest.tsx