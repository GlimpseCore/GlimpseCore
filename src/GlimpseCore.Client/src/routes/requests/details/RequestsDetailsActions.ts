import {
    REQUESTS_DETAILS_TAB_SELECTED,
    REQUESTS_DETAILS_SELECTED
} from './RequestsDetailsConstants';

import { fetchByContext } from 'modules/messages/MessagesActions';

export function tabSelected(target, previousTarget) {
    return {
        type: REQUESTS_DETAILS_TAB_SELECTED,
        target,
        previousTarget
    };
}

export function requestSelected(
    requestId,
    previousRequestId,
    webRequest,
    webResponse,
    previousRequestValid
) {
    return dispatch => {
        dispatch({
            type: REQUESTS_DETAILS_SELECTED,
            requestId,
            previousRequestId,
            webRequest,
            webResponse,
            previousRequestValid
        });

        dispatch(fetchByContext(requestId));
    };
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/RequestsDetailsActions.ts