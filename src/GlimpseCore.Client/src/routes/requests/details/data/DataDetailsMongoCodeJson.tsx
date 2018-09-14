import React from 'react'; // tslint:disable-line:no-unused-variable
import { connect } from 'react-redux';

import { getSelectedOperationSelector } from './DataSelectors';
import { IStoreState } from '@client/IStoreState';
import { getSelectedContextId } from '@routes/requests/RequestsSelector';
import {
    DataDetailsCodeJsonTree,
    IDataDetailsCodeJsonTree
} from '@client/routes/requests/details/data/DataDetailsCodeJsonTree';
import { isObjectEmpty } from '@common/util/CommonUtilities';

import { IDataOperation, DataOperationType } from '@routes/requests/details/data/DataInterfaces';

export const documentsTabName = 'documents';

function getCodeforDatabase(operation: IDataOperation, tabName: string) {
    if (tabName === documentsTabName) {
        if (operation.operationType === DataOperationType.Create) {
            return operation.docs;
        } else if (operation.operationType === DataOperationType.Update) {
            return operation.updates;
        } else {
            return '';
        }
    } else if (tabName === 'query') {
        return isObjectEmpty(operation.query) ? '{}' : operation.query;
    }
}

function mapStateToProps(state: IStoreState, ownProps): IDataDetailsCodeJsonTree {
    const operation = getSelectedOperationSelector(state) as IDataOperation;

    return {
        code: getCodeforDatabase(operation, ownProps.tabName),
        elementId: [`data-details-mongodb-documents-${operation.operationType}`, operation.eventId],
        requestId: getSelectedContextId(state)
    };
}

/* tslint:disable-next-line:variable-name */
export const DataDetailsMongoCodeJson = connect(mapStateToProps)(DataDetailsCodeJsonTree);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataDetailsMongoCodeJson.tsx