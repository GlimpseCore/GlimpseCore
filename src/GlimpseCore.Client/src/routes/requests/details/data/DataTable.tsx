import React from 'react'; // tslint:disable-line:no-unused-variable
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import {
    TimelineTable,
    ITimelineTableProps,
    ITimelineTableCallbacks,
    getActivityColumnPlaceholder
} from 'common/components/timeline/TimelineTable';
import { TimeDuration } from 'common/components/TimeDuration';
import TimelineActivity from 'common/components/timeline/TimelineActivity';
import {
    getFilteredByAllOperationsSelector,
    getSelectedOperationSelector
} from 'routes/requests/details/data/DataSelectors';
import { getSelectedContextId } from 'routes/requests/RequestsSelector';
import { getTimelineEventsOffsetBoundary } from './DataSelectors';
import { IStoreState } from 'client/IStoreState';
import { IDataOperation, DataDatabaseType } from './DataInterfaces';

import serviceTableStyles from 'routes/requests/details/service/views/ServiceTable.scss';
import timelineCommonStyles from 'client/routes/requests/details/timeline/views/TimelineCommon.scss';
import commonStyles from 'common/components/Common.scss';

import { DataStatusLabel } from 'common/components/DataStatusLabel';

const indexColumn = {
    headerFunc: () => {
        return (
            <div>
                <span>#</span>
            </div>
        );
    },
    valueFunc: (activity: IDataOperation) => {
        return (
            <div>
                <span>{activity.index}</span>
            </div>
        );
    },
    width: 4
};

const databaseColumn = {
    headerFunc: () => {
        return <span>Database</span>;
    },
    valueFunc: (activity: IDataOperation) => {
        const database = DataDatabaseType[activity.databaseType];
        return (
            <div title={`${database}(${activity.databaseName})`} className={commonStyles.trimText}>
                {database}
            </div>
        );
    },
    width: 10
};

const collectionColumn = {
    headerFunc: () => {
        return <span>Collection / Key</span>;
    },
    valueFunc: (activity: IDataOperation) => {
        const collection = activity.collection || '-';

        return <div className={commonStyles.trimText} title={collection}>{collection}</div>;
    },
    width: 18
};

const operationColumn = {
    headerFunc: () => {
        return <span>Operation</span>;
    },
    valueFunc: (activity: IDataOperation) => {
        const operation = `${activity.method} (${activity.operation})`;

        return <div className={commonStyles.trimText} title={operation}>{operation}</div>;
    },
    width: 18
};

const recordsColumn = {
    headerFunc: () => {
        return <span>Status</span>;
    },
    valueFunc: (activity: IDataOperation) => {
        return (
            <DataStatusLabel statusCode={activity.status} statusMessage={activity.statusMessage} />
        );
    },
    width: 12
};

const columns = [
    indexColumn,
    databaseColumn,
    collectionColumn,
    operationColumn,
    recordsColumn,
    getActivityColumnPlaceholder()
];

// tslint:disable-next-line:variable-name
const ActivityBar = (props: { activity: IDataOperation; metadata; totalDuration: number }) => {
    const { activity, metadata } = props;

    const metadataContainer = metadata
        ? <div className={serviceTableStyles.serviceTableActivityMetadataContainer}>
              {metadata}
          </div>
        : undefined;

    return (
        <div className={serviceTableStyles.serviceTableActivity}>
            <div
                className={timelineCommonStyles.timelineCategoryDataBackground}
                style={{ flexGrow: 1 }}
            />
            {metadataContainer}
        </div>
    );
};

const activityBarFunc = (activity: IDataOperation, params, metadata) => {
    const { totalDuration } = params;

    return (
        <ActivityBar activity={activity} metadata={metadata} totalDuration={totalDuration} /> // tslint:disable-line:no-any
    );
};

const activityFunc = (activity: IDataOperation, minOffset: number, maxOffset: number, params) => {
    const metadata = (
        <div className={serviceTableStyles.serviceTableActivityMetadata}>
            <TimeDuration duration={activity.duration} />
        </div>
    );

    return (
        <TimelineActivity
            key={activity.eventId}
            activity={activity}
            activityBarFunc={activityBarFunc}
            minOffset={minOffset}
            maxOffset={maxOffset}
            metadata={metadata}
            params={params}
        />
    );
};

function mapStateToProps(state: IStoreState, props): Partial<ITimelineTableProps<{}>> {
    const spans = getFilteredByAllOperationsSelector(state);
    let { minOffset, maxOffset } = getTimelineEventsOffsetBoundary(state);

    // add some space at the end
    maxOffset *= 1.1;

    return {
        activityFunc,
        columns,
        maxOffset,
        minOffset,
        offsetTicks: 5,
        params: {
            totalDuration: maxOffset
        },
        spans,
        selectedActivity: getSelectedOperationSelector(state),
        requestId: getSelectedContextId(state),
        rowClassName: commonStyles.tableSelectableRow,
        selectedRowClassName: commonStyles.tableSelectedRow,
        shouldAutoSelectFirstActivity: true
    };
}

function mapDispatchToProps(dispatch): ITimelineTableCallbacks {
    return {
        onSelectActivity: (activity: IDataOperation, requestId: string) => {
            dispatch(push(`/requests/${requestId}/data/${activity.eventId}`));
        }
    };
}

// tslint:disable-next-line:variable-name
export const DataTable = connect(mapStateToProps, mapDispatchToProps)(TimelineTable);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataTable.tsx