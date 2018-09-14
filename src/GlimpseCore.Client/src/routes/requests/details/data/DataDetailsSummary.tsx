import React from 'react'; // tslint:disable-line:no-unused-variable
import { connect } from 'react-redux';

import commonStyles from '@common/components/Common.scss';

import { TimelineTable, ITimelineTableProps } from '@common/components/timeline/TimelineTable';
import { ITimelineComponentSpan } from '@common/components/timeline/TimelineCommonInterfaces';
import { getSelectedOperationSelector } from '@routes/requests/details/data/DataSelectors';
import { DataOperationType, DataDatabaseType, IDataOperation } from '@routes/requests/details/data/DataInterfaces';
import { getSelectedContextId } from '@routes/requests/RequestsSelector';
import { IStoreState } from '@client/IStoreState';
import { isArray } from '@common/util/CommonUtilities';
import JsonTree from '@client/routes/requests/components/JsonTree';

const firstColumnWidth = 30;
const nameColumn = {
    headerFunc: () => {
        return (
            <div>
                <span>Name</span>
            </div>
        );
    },
    valueFunc: activity => {
        return (
            <div title={`${activity.name}`} className={commonStyles.trimText}>
                {activity.name}
            </div>
        );
    },
    width: firstColumnWidth
};

const valueColumn = {
    headerFunc: () => {
        return <span>Value</span>;
    },
    valueFunc: activity => {
        const { name, eventId, requestId } = activity;
        const { value } = activity;

        return (
            <div className={!isArray(value) ? commonStyles.trimText : ''}>
                {isArray(value)
                    ? <JsonTree data={value} elementId={[name, eventId]} requestId={requestId} />
                    : value}
            </div>
        );
    },
    width: 100 - firstColumnWidth
};

const timelineSpanMix = {
    ordinal: 0,
    offset: 0,
    duration: 0
};

interface ISpanRecord extends ITimelineComponentSpan {
    name: string;
    value: string | string[] | number;
}

function mapStateToProps(state: IStoreState, props): Partial<ITimelineTableProps<{}>> {
    const activity = getSelectedOperationSelector(state) as IDataOperation;
    const requestId = getSelectedContextId(state);
    const { operation, operationType, eventId, recordCount, insertedIds } = activity;

    // get operation past tense:
    //   - Read -> Read
    //   - Update -> Updated
    //   - Create -> Created
    //   - Delete -> Deleted
    const operationName = operation.toLowerCase();
    const operationPastTense = operationType === DataOperationType.Read
        ? operationName
        : `${operationName}d`;

    const spans: ISpanRecord[] = [
        {
            ...timelineSpanMix,
            requestId,
            eventId: `count__${eventId}`,
            index: 0,
            name: `Records ${operationPastTense}`,
            value: `${recordCount}`
        }
    ];

    if (insertedIds) {
        spans.push({
            ...timelineSpanMix,
            requestId,
            eventId: `insertedIds__${eventId}`,
            index: 1,
            name: 'Inserted IDs',
            value: insertedIds
        });
    }

    if (
        activity.databaseType === DataDatabaseType.MongoDB &&
        activity.operationType === DataOperationType.Update
    ) {
        spans.push(
            {
                ...timelineSpanMix,
                requestId,
                eventId: `matchedCount__${eventId}`,
                index: 2,
                name: 'Matched Count',
                value: activity.matchedCount
            },
            {
                ...timelineSpanMix,
                requestId,
                eventId: `modifiedCount__${eventId}`,
                index: 3,
                name: 'Modified Count',
                value: activity.modifiedCount
            },
            {
                ...timelineSpanMix,
                requestId,
                eventId: `upsertedCount__${eventId}`,
                index: 4,
                name: 'Upserted Count',
                value: activity.upsertedCount
            }
        );
    }

    return {
        spans,
        columns: [nameColumn, valueColumn],
        rowClassName: commonStyles.tableSelectableRow
    };
}

// tslint:disable-next-line:variable-name
export const DataDetailsSummary = connect(mapStateToProps)(TimelineTable);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataDetailsSummary.tsx