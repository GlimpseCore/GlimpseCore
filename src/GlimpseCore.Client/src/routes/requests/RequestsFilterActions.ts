import { createActionCreator, createSimpleActionCreator } from '@common/actions/ActionCreator';
import { IRequestsFilterState } from './RequestsFilterInterfaces';

export const applyFilterStateAction = createActionCreator<IRequestsFilterState>(
    'request.controls.applyFilterState'
);
export const resetFilterStateAction = createSimpleActionCreator(
    'request.controls.resetFilterState'
);



// WEBPACK FOOTER //
// ./src/client/routes/requests/RequestsFilterActions.ts