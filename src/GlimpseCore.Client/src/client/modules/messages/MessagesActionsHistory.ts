import {
    MESSAGES_REQUESTED_BATCH_HISTORY,
    MESSAGES_RECEIVED_BATCH_HISTORY,
    MESSAGES_REQUESTED_ITEM_HISTORY,
    MESSAGES_RECEIVED_ITEM_HISTORY,
    messageSummaryTypes
} from './MessagesConstants';

import { current as currentMetadata } from 'modules/metadata/MetadataActions';

// TODO: need to deal with error cases

export function fetchAll(callback) {
    return dispatch => {
        currentMetadata(metadata => {
            dispatch({ type: MESSAGES_REQUESTED_BATCH_HISTORY });

            const uri = (metadata.resources['message-history'] as any) // tslint:disable-line:no-any
                .fill({
                    hash: metadata.hash,
                    types: messageSummaryTypes
                });

            fetch(uri).then(response => response.json()).then(response => {
                const messages = response;

                dispatch({
                    type: MESSAGES_RECEIVED_BATCH_HISTORY,
                    source: 'history',
                    messages
                });

                callback(messages);
            });
        });
    };
}

export function fetchByContext(contextId, callback) {
    return dispatch => {
        currentMetadata(metadata => {
            dispatch({
                type: MESSAGES_REQUESTED_ITEM_HISTORY,
                contextId
            });

            const uri = (metadata.resources.context as any) // tslint:disable-line:no-any
                .fill({
                    hash: metadata.hash,
                    contextId: contextId
                });

            return fetch(uri).then(response => response.json()).then(response => {
                const messages = response;

                dispatch({
                    type: MESSAGES_RECEIVED_ITEM_HISTORY,
                    source: 'history',
                    contextId,
                    messages
                });

                callback(messages);
            });
        });
    };
}



// WEBPACK FOOTER //
// ./src/client/modules/messages/MessagesActionsHistory.ts