import {
    createActionCreator,
    createSimpleActionCreator,
    createRequestPersistedActionCreator
} from 'common/actions/ActionCreator';

export const toggleDatabaseFilterAction = createActionCreator<string>(
    'request.detail.data.toggle.database'
);
export const toggleOperationFilterAction = createActionCreator<string>(
    'request.detail.data.toggle.operation'
);

export const showAllAction = createSimpleActionCreator('request.detail.data.all');

export const selectExchangeAction = createRequestPersistedActionCreator<{
    requestId: string;
    exchangeId: string;
}>('request.detail.data.selectExchange');



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataActions.ts