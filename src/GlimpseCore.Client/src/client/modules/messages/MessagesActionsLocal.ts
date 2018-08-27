import { MESSAGES_REQUESTED_BATCH_LOCAL, MESSAGES_RECEIVED_BATCH_LOCAL } from './MessagesConstants';

// TODO: need to deal with error cases

export function fetchAll(callback) {
    // NOTE: this could be done without the requested/received pair, but
    //       kept for consistency
    return dispatch => {
        dispatch({ type: MESSAGES_REQUESTED_BATCH_LOCAL });

        const messages = localStorage.getItem('glimpseMessages');
        dispatch({
            type: MESSAGES_RECEIVED_BATCH_LOCAL,
            source: 'local',
            messages
        });

        if (callback) {
            callback(messages);
        }
    };
}



// WEBPACK FOOTER //
// ./src/client/modules/messages/MessagesActionsLocal.ts