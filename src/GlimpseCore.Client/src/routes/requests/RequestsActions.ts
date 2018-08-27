import { replace } from 'react-router-redux';
import { push } from 'react-router-redux';
import { Dispatch } from 'redux';

import { createSimpleActionCreator } from 'common/actions/ActionCreator';
import { MESSAGES_CLEAR_ALL } from 'modules/messages/MessagesConstants';
import { setupPurgeOldRecords } from 'common/util/ReducerUtilities';

const clearAll = createSimpleActionCreator(MESSAGES_CLEAR_ALL);

export function clearAllAction() {
    return dispatch => {
        dispatch(replace(`/requests`));
        dispatch(clearAll());
    };
}

export const disableFollowModeAction = createSimpleActionCreator(
    'request.controls.followMode.disable'
);

export const toggleFollowModeAction = createSimpleActionCreator(
    'request.controls.followMode.toggle'
);

export const toggleFilterModeAction = createSimpleActionCreator(
    'request.controls.filterMode.toggle'
);

function selectRequest(requestId: string) {
    return push(`/requests/${requestId}`);
}

export function selectRequestPreserveFollowAction(requestId: string) {
    return selectRequest(requestId);
}

export function selectRequestAction(requestId: string) {
    return dispatch => {
        dispatch(disableFollowModeAction());
        dispatch(selectRequest(requestId));
    };
}

export const purgeOldRequestsAction = createSimpleActionCreator('request.purgeOldRequests');

// tslint:disable-next-line:no-any
export function setupRequestPurgeOldRecords(dispatcher: Dispatch<any>) {
    setupPurgeOldRecords(purgeOldRequestsAction, dispatcher);
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/RequestsActions.ts