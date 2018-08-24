import {
    MESSAGES_REQUESTED_BATCH,
    MESSAGES_RECEIVED_BATCH,
    MESSAGES_REQUESTED_ITEM,
    MESSAGES_RECEIVED_ITEM
} from './MessagesConstants';

import * as historyMessages from './MessagesActionsHistory';
import * as liveMessages from './MessagesActionsLive';
import * as localMessages from './MessagesActionsLocal';

export function fetchReceived(dispatch, messages, source) {
    dispatch({ type: MESSAGES_RECEIVED_BATCH, source, messages });
}

export function fetch() {
    return dispatch => {
        dispatch({ type: MESSAGES_REQUESTED_BATCH });

        dispatch(localMessages.fetchAll(results => fetchReceived(dispatch, results, 'local')));
        dispatch(liveMessages.subscribeAll(results => fetchReceived(dispatch, results, 'live')));
        dispatch(historyMessages.fetchAll(results => fetchReceived(dispatch, results, 'history')));
    };
}

function fetchByContextReceived(dispatch, contextId, messages, source) {
    dispatch({
        type: MESSAGES_RECEIVED_ITEM,
        source,
        contextId,
        messages
    });
}

export function fetchByContext(contextId) {
    return dispatch => {
        dispatch({ type: MESSAGES_REQUESTED_ITEM, contextId });

        dispatch(
            liveMessages.subscribeByContext(contextId, results =>
                fetchByContextReceived(dispatch, contextId, results, 'live')
            )
        );
        dispatch(
            historyMessages.fetchByContext(contextId, results =>
                fetchByContextReceived(dispatch, contextId, results, 'history')
            )
        );
    };
}



// WEBPACK FOOTER //
// ./src/client/modules/messages/MessagesActions.ts