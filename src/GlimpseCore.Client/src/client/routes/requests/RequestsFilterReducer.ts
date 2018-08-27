import { Action } from 'redux';

import { IRequestsFilterState } from './RequestsFilterInterfaces';
import { applyFilterStateAction, resetFilterStateAction } from './RequestsFilterActions';
import { ContentTypeClass } from 'common/util/ContentTypes';

export const initialState: IRequestsFilterState = {
    method: {},
    status: {},
    contentTypeClass: ContentTypeClass.Data | ContentTypeClass.Document // tslint:disable-line:no-bitwise
};

const applyFilterState = (
    state: IRequestsFilterState,
    update: IRequestsFilterState
): IRequestsFilterState => {
    return update;
};

export default function requestsViewResizeReducer(
    state: IRequestsFilterState = initialState,
    action: Action
): IRequestsFilterState {
    switch (action.type) {
        case applyFilterStateAction.type:
            return applyFilterState(state, applyFilterStateAction.unwrap(action));
        case resetFilterStateAction.type:
            return initialState;
        default:
            return state;
    }
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/RequestsFilterReducer.ts