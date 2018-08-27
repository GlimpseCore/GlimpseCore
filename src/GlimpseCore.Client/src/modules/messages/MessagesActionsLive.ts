import {
    MESSAGES_REQUESTED_BATCH_LIVE,
    MESSAGES_RECEIVED_BATCH_LIVE,
    MESSAGES_REQUESTED_ITEM_LIVE,
    MESSAGES_RECEIVED_ITEM_LIVE,
    SERVER_HEARTBEAT_CONNECTED,
    SERVER_HEARTBEAT_ERROR,
    messageSummaryTypes
} from './MessagesConstants';

import { current as currentMetadata } from '@modules/metadata/MetadataActions';

// TODO: don't like having the callbacks here but need to for the moment

const CONNECTION_RETRY_INTERVAL = 2000;

let connectionAll = undefined;
export function subscribeAll(callback) {
    return dispatch => {
        if (!connectionAll) {
            currentMetadata(metadata => {
                dispatch({ type: MESSAGES_REQUESTED_BATCH_LIVE });

                const uri = (metadata.resources['message-stream'] as any) // tslint:disable-line:no-any
                    .fill({ types: messageSummaryTypes });

                const initConnect = () => {
                    connectionAll = new EventSource(uri);

                    connectionAll.addEventListener('message', e => {
                        const messages = JSON.parse(e.data);

                        dispatch({
                            type: MESSAGES_RECEIVED_BATCH_LIVE,
                            source: 'live',
                            messages
                        });
                        if (callback) {
                            callback(messages);
                        }
                    });

                    connectionAll.onopen = () => {
                        dispatch({
                            type: SERVER_HEARTBEAT_CONNECTED
                        });
                    };

                    connectionAll.onerror = () => {
                        dispatch({
                            type: SERVER_HEARTBEAT_ERROR
                        });

                        // if a connection error occurs,
                        // kill the connection and try restarting it
                        // every 2 seconds. Firefox will typically not call
                        // onopen on server reconnect.
                        connectionAll.close();
                        setTimeout(initConnect, CONNECTION_RETRY_INTERVAL);
                    };
                };

                initConnect();
            });
        }
    };
}

let connectionBy = undefined;
export function subscribeByContext(contextId, callback) {
    return dispatch => {
        if (connectionBy) {
            connectionBy.close();
        }

        currentMetadata(metadata => {
            dispatch({
                type: MESSAGES_REQUESTED_ITEM_LIVE,
                contextId
            });

            const uri = (metadata.resources['message-stream'] as any) // tslint:disable-line:no-any
                .fill({
                    contextId
                });

            const initConnection = () => {
                connectionBy = new EventSource(uri);
                connectionBy.addEventListener('message', e => {
                    const messages = JSON.parse(e.data);

                    dispatch({
                        type: MESSAGES_RECEIVED_ITEM_LIVE,
                        source: 'live',
                        contextId,
                        messages
                    });
                    if (callback) {
                        callback(messages);
                    }
                });

                connectionBy.onerror = () => {
                    // if a connection error occurs,
                    // kill the connection and try restarting it
                    // every 2 seconds. Firefox will typically not call
                    // onopen on server reconnect.
                    connectionBy.close();
                    setTimeout(initConnection, CONNECTION_RETRY_INTERVAL);
                };
            };

            initConnection();
        });
    };
}

window.addEventListener('beforeunload', () => {
    if (connectionAll) {
        connectionAll.close();
    }

    if (connectionBy) {
        connectionBy.close();
    }
});



// WEBPACK FOOTER //
// ./src/client/modules/messages/MessagesActionsLive.ts