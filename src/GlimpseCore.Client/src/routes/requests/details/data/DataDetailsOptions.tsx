import React from 'react'; // tslint:disable-line:no-unused-variable
import { connect } from 'react-redux';

import commonStyles from '@common/components/Common.scss';

import { TimelineTable, ITimelineTableProps } from '@common/components/timeline/TimelineTable';
import { getSelectedOperationSelector } from '@routes/requests/details/data/DataSelectors';
import { getSelectedContextId } from '@routes/requests/RequestsSelector';
import { IStoreState } from '@client/IStoreState';
import { isArray, isObject } from '@common/util/CommonUtilities';
import JsonTree from '@client/routes/requests/components/JsonTree';
import { DataDatabaseType } from './DataInterfaces';

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
    width: 30
};

const valueColumn = {
    headerFunc: () => {
        return <span>Value</span>;
    },
    valueFunc: activity => {
        const { name, eventId, requestId } = activity;
        let { value } = activity;
        const isJSON = isObject(value) || isArray(value);
        const className = !isJSON ? commonStyles.trimText : '';
        const title = !isJSON || isArray(value)
            ? activity.value
            : Object.keys(isArray(value)).length;

        return (
            <div title={`${title}`} className={className}>
                {isJSON
                    ? <JsonTree data={value} elementId={[name, eventId]} requestId={requestId} />
                    : `${value}`}
            </div>
        );
    },
    width: 70
};

const timelineSpanMix = {
    ordinal: 0,
    offset: 0,
    duration: 0
};

const getColumns = (database: DataDatabaseType) => {
    const columns = [nameColumn, valueColumn];

    switch (database) {
        case DataDatabaseType.Redis:
            columns[0].width = 15;
            columns[1].width = 85;
            break;

        default:
            columns[0].width = 30;
            columns[1].width = 70;
    }

    return columns;
};

function mapStateToProps(state: IStoreState, props): Partial<ITimelineTableProps<{}>> {
    const operation = getSelectedOperationSelector(state);
    const { options, databaseType, eventId } = operation;
    const requestId = getSelectedContextId(state);

    const spans = [];
    let index = 0;
    for (let name of Object.keys(options)) {
        const value = options[name];
        spans.push({
            ...timelineSpanMix,
            eventId: `${name}__${eventId}`,
            requestId,
            index,
            name,
            value
        });
        index++;
    }

    return {
        spans,
        columns: getColumns(databaseType),
        rowClassName: commonStyles.tableSelectableRow
    };
}

// tslint:disable-next-line:variable-name
export const DataDetailsOptions = connect(mapStateToProps)(TimelineTable);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataDetailsOptions.tsx