import {
    createActionCreator,
    createRequestPersistedActionCreator,
    createSimpleActionCreator
} from '@common/actions/ActionCreator';

export const selectExchangeAction = createRequestPersistedActionCreator<{
    requestId: string;
    exchangeId: string;
}>('request.detail.service.selectExchange');

export const toggleStatusCodeClassActionID = 'request.detail.service.toggleStatusCodeClass';
export const toggleAgentActionID = 'request.detail.service.toggleAgent';
export const resetAllActionID = 'request.detail.service.resetAll';

export const resetAllAction = createSimpleActionCreator(resetAllActionID);
export const toggleStatusCodeClassAction = createActionCreator<number>(
    toggleStatusCodeClassActionID
);
export const toggleAgentAction = createActionCreator<number>(toggleAgentActionID);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/service/ServiceActions.ts