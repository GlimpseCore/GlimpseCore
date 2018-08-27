import * as Glimpse from '@glimpse/glimpse-definitions';
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import UrlText from 'common/components/UrlText';
import StatusLabel from 'common/components/StatusLabel';
import { calculateDuration } from 'client/routes/requests/details/RequestsDetailsSelector';
import { getSingleMessageByType } from 'client/routes/requests/RequestsSelector';
import TimeDuration from 'common/components/TimeDuration';
import { IStoreState } from 'client/IStoreState';

import { IRequest } from 'routes/requests/RequestsInterfaces';

import styles from './RequestsOverviewTopPanel.scss';

export interface IRequestsOverviewTopPanelProps {
    request: IRequest;
    url: string;
    protocol: string;
    method: string;
    statusCode: number;
    statusMessage: string;
    duration: number;
}

// RegExp taht holds protocol://domain:port
const domainRegexp = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)(:\d+)/gim;

export class RequestsOverviewTopPanel extends React.Component<IRequestsOverviewTopPanelProps, {}> {
    public render() {
        const { url, protocol, method, statusCode, statusMessage, duration } = this.props;

        const sanitizedUrl = url.replace(domainRegexp, '');
        return (
            <div className={styles.panel}>
                <div className={styles.group}>
                    <span className={styles.method}>
                        {method}
                    </span>
                </div>

                <div className={classNames(styles.group, styles.isUrlGroup)}>
                    <UrlText url={sanitizedUrl} protocol={protocol} title={url} />
                </div>

                <div
                    className={classNames(
                        styles.group,
                        styles.isPullRight,
                        styles.isNoRightPadding
                    )}>
                    <StatusLabel statusCode={statusCode} statusMessage={statusMessage} />
                </div>

                <div className={classNames(styles.group, styles.isPullRight)}>
                    <TimeDuration duration={duration} />
                </div>
            </div>
        );
    }
}

function mapStateToProps(
    state: IStoreState,
    ownProps: { request: IRequest }
): IRequestsOverviewTopPanelProps {
    const { request } = ownProps;
    const { webRequest, webResponse } = request;

    const browserNavigationTimingMessage = getSingleMessageByType<
        Glimpse.Messages.Payloads.Browser.INavigationTiming
    >(request.context.byType, Glimpse.Messages.Payloads.Browser.NavigationTimingType);
    const browserNavigationTiming =
        browserNavigationTimingMessage && browserNavigationTimingMessage.payload;

    const duration = calculateDuration(webResponse, browserNavigationTiming);

    return {
        request: request,
        url: webRequest.url,
        protocol: webRequest.protocol.identifier,
        method: webRequest.method,
        statusCode: webResponse.statusCode,
        statusMessage: webResponse.statusMessage,
        duration
    };
}

export default connect(mapStateToProps)(RequestsOverviewTopPanel);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/views/RequestsOverviewTopPanel.tsx