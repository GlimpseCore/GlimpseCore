import React from 'react'; // tslint:disable-line:no-unused-variable
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import classNames from 'classnames';

import AgentTypeIcon from 'common/components/AgentTypeIcon';
import { getContentType, getMediaTypeFromContentType } from 'common/util/ContentTypes';
import {
    getStatusCodeFilteredWebServiceExchanges,
    getSelectedExchange,
    getTimelineEventsOffsetBoundary
} from '../ServiceSelectors';
import StackFrame from 'common/components/StackFrame';
import Icon from 'common/components/Icon';
import { IExchangeModel } from '../ServiceInterfaces';
import { IStoreState } from 'client/IStoreState';
import RouteButton from 'common/components/RouteButton';
import { SERVICE_TAB_NAME } from '../ServiceConstants';
import StatusLabel from 'common/components/StatusLabel';
import { formatMilliseconds, TimeDuration } from 'common/components/TimeDuration';
import { toStringWithFixedPoints } from 'common/util/StringUtilities';
import TimelineActivity from 'common/components/timeline/TimelineActivity';
import {
    TimelineTable,
    ITimelineTableProps,
    ITimelineTableCallbacks,
    getActivityColumnPlaceholder
} from 'common/components/timeline/TimelineTable';
import UrlText from 'common/components/UrlText';

import commonStyles from 'common/components/Common.scss';
import styles from './ServiceTable.scss';

// tslint:disable-next-line:variable-name
const ServiceActivityBar = (props: {
    activity: IExchangeModel;
    metadata;
    totalDuration: number;
}) => {
    const { activity, metadata } = props;

    const metadataContainer = metadata
        ? <div className={styles.serviceTableActivityMetadataContainer}>
              {metadata}
          </div>
        : undefined;

    let responseStart = 0;
    let responseEnd = 0;
    let hasResponseStart = true;

    if (activity.response && activity.response.payload && activity.response.payload.timing) {
        responseStart = activity.response.payload.timing.responseStart;
        responseEnd = activity.response.payload.timing.responseEnd;
    }
    if (responseStart === undefined) {
        responseStart = 0;
        hasResponseStart = false;
    }

    const { totalDuration } = props;

    const requestStyle: React.CSSProperties = {
        flexGrow: responseStart / responseEnd
    };

    const responseStyle: React.CSSProperties = {
        flexGrow: (responseEnd - responseStart) / responseEnd
    };

    let title = `From start: ${formatMilliseconds(activity.offset)}`;

    const contentType = getContentType(activity.response.payload.headers);
    const mediaType = contentType ? getMediaTypeFromContentType(contentType) : undefined;

    if (mediaType) {
        title += `\nContent type: ${mediaType}`;
    }

    const percentageDuration = responseEnd / totalDuration * 100;
    const percentageDurationString = toStringWithFixedPoints(percentageDuration, 1);

    if (hasResponseStart) {
        title +=
            `\nSending: ${formatMilliseconds(responseStart)}` +
            `\nDownloading: ${formatMilliseconds(responseEnd - responseStart)}`;
    }
    title += `\nTotal: ${formatMilliseconds(responseEnd)} (${percentageDurationString}%)`;

    return (
        <div className={styles.serviceTableActivity} title={title}>
            <div className={styles.serviceTableRequestActivity} style={requestStyle} />
            <div className={styles.serviceTableResponseActivity} style={responseStyle} />
            {metadataContainer}
        </div>
    );
};

const activityBarFunc = (activity: IExchangeModel, params, metadata) => {
    const { totalDuration } = params;

    return (
        <ServiceActivityBar activity={activity} metadata={metadata} totalDuration={totalDuration} />
    );
};

const activityFunc = (activity: IExchangeModel, minOffset: number, maxOffset: number, params) => {
    if (activity.response) {
        const metadata = (
            <div className={styles.serviceTableActivityMetadata}>
                <TimeDuration duration={activity.duration} />
            </div>
        );

        return (
            <TimelineActivity
                activity={activity}
                activityBarFunc={activityBarFunc}
                minOffset={minOffset}
                maxOffset={maxOffset}
                metadata={metadata}
                params={params}
            />
        );
    } else {
        const noResponseDataText = 'No response data';

        const title =
            `From start: ${formatMilliseconds(activity.offset)}` + `\n${noResponseDataText}`;

        return (
            <div className={styles.serviceTableNoResponse} title={title}>
                {noResponseDataText}
            </div>
        );
    }
};

const indexColumn = {
    headerFunc: () => {
        return (
            <div className={styles.serviceTableIndexContainer}>
                <AgentTypeIcon />
                <span className={styles.serviceTableIndexText}>#</span>
            </div>
        );
    },
    valueFunc: (activity: IExchangeModel) => {
        return (
            <div className={styles.serviceTableIndexContainer}>
                <AgentTypeIcon agentType={activity.agent} />
                <span className={styles.serviceTableIndexText}>{activity.index}</span>
            </div>
        );
    },
    width: 8
};

const urlColumn = {
    headerFunc: () => {
        return <span className={styles.serviceTableUrlHeader}>Url</span>;
    },
    valueFunc: (activity: IExchangeModel) => {
        const urlText = activity.request
            ? <UrlText
                  alignHttpsIcon={true}
                  url={activity.request.payload.url}
                  protocol={activity.request.payload.protocol.identifier}
              />
            : <UrlText alignHttpsIcon={true} url="-" protocol="http" />;

        const link = activity.linkedContextId
            ? <RouteButton
                  className={styles.serviceTableLinkButton}
                  label="This call is an application server request. Click to view more details."
                  to={`/requests/${activity.linkedContextId}/request`}>
                  <Icon shape="Go" className={styles.serviceTableLinkIcon} />
              </RouteButton>
            : // To preserve alignment of URL text and links, return a placeholder <div> with the margin and width of the button and icon...
              <div
                  className={classNames(styles.serviceTableLinkButton, styles.serviceTableLinkIcon)}
              />;

        return (
            <div className={styles.serviceTableUrlContainer}>
                {urlText}
                {link}
            </div>
        );
    },
    width: 24
};

const methodColumn = {
    headerClassName: styles.serviceTableMethodColumn,
    headerFunc: () => 'Method',
    valueClassName: commonStyles.trimText,
    valueFunc: (activity: IExchangeModel) => {
        return activity.request
            ? <span title={activity.request.payload.method}>{activity.request.payload.method}</span>
            : '-';
    },
    width: 8
};

const statusColumn = {
    headerFunc: () => 'Status',
    valueFunc: (activity: IExchangeModel) => {
        return activity.response
            ? <StatusLabel
                  statusCode={activity.response.payload.statusCode}
                  statusMessage={activity.response.payload.statusMessage}
              />
            : undefined;
    },
    width: 9
};

const locationColumn = {
    headerFunc: () => 'Location',
    valueFunc: (activity: IExchangeModel) => {
        const payload = activity.request && activity.request.payload
            ? activity.request.payload
            : undefined;
        const topFrame = payload && payload.frames ? payload.frames[0] : undefined;

        return <StackFrame frame={topFrame} />;
    },
    width: 10
};

const columns = [
    indexColumn,
    urlColumn,
    methodColumn,
    statusColumn,
    locationColumn,
    getActivityColumnPlaceholder()
];

function mapStateToProps(state: IStoreState, props): Partial<ITimelineTableProps<{}>> {
    const { exchanges } = getStatusCodeFilteredWebServiceExchanges(state);
    let { minOffset, maxOffset } = getTimelineEventsOffsetBoundary(state);

    // timeline table enforces maxOffset > minOffset, so ensure that here.
    if (minOffset === maxOffset) {
        maxOffset += 1;
    }

    return {
        activityFunc,
        columns,
        maxOffset,
        minOffset,
        offsetTicks: 5,
        params: {
            totalDuration: maxOffset
        },
        selectedActivity: getSelectedExchange(state),
        rowClassName: commonStyles.tableSelectableRow,
        selectedRowClassName: commonStyles.tableSelectedRow,
        spans: exchanges,
        shouldAutoSelectFirstActivity: true
    };
}

function mapDispatchToProps(dispatch, props): ITimelineTableCallbacks {
    return {
        onSelectActivity: (activity: IExchangeModel) => {
            const requestId = activity.request
                ? activity.request.context.id
                : activity.response.context.id;
            const exchangeId = activity.eventId;

            dispatch(push(`/requests/${requestId}/${SERVICE_TAB_NAME}/${exchangeId}`));
        }
    };
}

export const ServiceTable = connect(mapStateToProps, mapDispatchToProps)(TimelineTable); // tslint:disable-line:variable-name

export default ServiceTable;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/service/views/ServiceTable.tsx