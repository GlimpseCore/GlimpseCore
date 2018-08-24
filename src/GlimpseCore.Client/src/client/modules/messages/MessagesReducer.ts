import { IMessagesState } from './IMessagesState';
import { IMessage } from './schemas/IMessage';

import {
    MESSAGES_RECEIVED_BATCH,
    MESSAGES_RECEIVED_ITEM,
    MESSAGES_REQUESTED_ITEM,
    MESSAGES_CLEAR_ALL,
    SERVER_HEARTBEAT_CONNECTED,
    SERVER_HEARTBEAT_ERROR
} from './MessagesConstants';

/**
 * Function to create a map of `ids` from a list.
 * @param {Array} List with items.
 * @returns {Object} Map of all `id`s in the input list.
 */
export const createIdMapFromList = (list: IMessage<{}>[]): { [key: string]: boolean } => {
    return list.reduce((acc, current, index) => {
        acc[current.context.id] = true;
        return acc;
    }, {});
};

export const initialState: IMessagesState = {
    selectedContextId: undefined,
    clearedRequestsMap: {},
    listing: [],
    heartbeat: true,
    version: 1
};

/**
 * The reducer for the session (i.e. non-persisted) state related to the messages retrieved by the application
 *
 * @param state The previous state
 * @param action An action to manipulate state
 *
 * @returns The new state
 */
export function messagesSessionReducer(
    state: IMessagesState = initialState,
    action
): IMessagesState {
    switch (action.type) {
        case MESSAGES_RECEIVED_BATCH:
        case MESSAGES_RECEIVED_ITEM:
            const listing = state.listing.concat(action.messages || []);

            return { ...state, listing };

        case MESSAGES_REQUESTED_ITEM:
            return { ...state, selectedContextId: action.contextId };

        case MESSAGES_CLEAR_ALL:
            const clearedRequestsMap = createIdMapFromList(state.listing);

            return {
                ...initialState,
                clearedRequestsMap: {
                    ...state.clearedRequestsMap,
                    ...clearedRequestsMap
                },
                version: state.version + 1
            };

        case SERVER_HEARTBEAT_CONNECTED:
            if (!state.heartbeat) {
                return {
                    ...state,
                    heartbeat: true
                };
            }

            return state;

        case SERVER_HEARTBEAT_ERROR:
            if (state.heartbeat) {
                return {
                    ...state,
                    heartbeat: false
                };
            }

            return state;

        default:
            return state;
    }
}



// WEBPACK FOOTER //
// ./src/client/modules/messages/MessagesReducer.ts