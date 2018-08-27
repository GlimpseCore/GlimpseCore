import { fetchReceivedPayloadAction } from './MetadataActions';

const initialState = {};

/**
 * The reducer for the session (i.e. non-persisted) state related to the application's metadata
 *
 * @param state The previous state
 * @param action An action to manipulate state
 *
 * @returns The new state
 */
export function metadataSessionReducer(state = initialState, action) {
    if (action.type === fetchReceivedPayloadAction.type) {
        const payload = fetchReceivedPayloadAction.unwrap(action);
        const metadata = payload.metadata;

        return Object.assign({}, metadata, state);
    }

    return state;
}



// WEBPACK FOOTER //
// ./src/client/modules/metadata/MetadataReducer.ts