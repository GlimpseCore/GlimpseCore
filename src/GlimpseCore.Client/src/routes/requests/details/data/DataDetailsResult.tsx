import React from 'react'; // tslint:disable-line:no-unused-variable
import { connect } from 'react-redux';

import { getSelectedOperationSelector } from './DataSelectors';
import { IStoreState } from 'client/IStoreState';
import { getSelectedContextId } from 'routes/requests/RequestsSelector';
import {
    DataDetailsCodeJsonTree,
    IDataDetailsCodeJsonTree
} from 'client/routes/requests/details/data/DataDetailsCodeJsonTree.tsx';

function mapStateToProps(state: IStoreState, ownProps): IDataDetailsCodeJsonTree {
    const operation = getSelectedOperationSelector(state);

    return {
        code: operation.result,
        elementId: ['data-details-redis-result', operation.eventId],
        requestId: getSelectedContextId(state)
    };
}

/* tslint:disable-next-line:variable-name */
export const DataDetailsResult = connect(mapStateToProps)(DataDetailsCodeJsonTree);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataDetailsResult.tsx