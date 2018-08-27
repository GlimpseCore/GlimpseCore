import { connect } from 'react-redux';

import { getSelectedOperationSelector } from './DataSelectors';
import { IStoreState } from '@client/IStoreState';
import { DataDatabaseType } from '@client/routes/requests/details/data/DataInterfaces';

import {
    FixedWidthLeftColumnTable,
    ITableProps,
    nameValueColumns
} from '@common/components/FixedWidthLeftColumnTable';

import styles from './DataDetailsConnection.scss';

function mapStateToProps(state: IStoreState): ITableProps {
    const operation = getSelectedOperationSelector(state);

    const params = [
        {
            name: 'Host',
            value: operation.serverName
        },
        {
            name: 'Port',
            value: operation.connectionPort
        },
        {
            name: 'Database name',
            value: operation.databaseName
        }
    ];
    // add collection column only for `MongoDB` database
    if (operation.databaseType === DataDatabaseType.MongoDB) {
        params.push({
            name: 'Collection',
            value: operation.collection
        });
    }

    return {
        className: styles.table,
        columns: nameValueColumns,
        params
    };
}

// tslint:disable-next-line:variable-name
export const DataDetailsConnection = connect(mapStateToProps)(FixedWidthLeftColumnTable);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataDetailsConnection.tsx