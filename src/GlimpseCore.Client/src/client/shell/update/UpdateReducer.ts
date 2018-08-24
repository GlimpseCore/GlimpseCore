import { Action } from 'redux';

import { IUpdatePersistedState } from './UpdateInterfaces';
import { showLatestVersionAction, resetLatestVersionAction } from './UpdateActions';

const initialState = {
    latestVersion: undefined,
    dateTimeChecked: undefined,
    atTimeOfCheckVersion: undefined
};

/**
 * The reducer for the persisted, non-request-specific state related to the shell theme
 */
export function updatePersistedReducer(
    state: IUpdatePersistedState = initialState,
    action: Action
) {
    if (action.type === showLatestVersionAction.type) {
        const payload = showLatestVersionAction.unwrap(action);

        return { ...payload };
    } else if (action.type === resetLatestVersionAction.type) {
        return initialState;
    }

    return state;
}



// WEBPACK FOOTER //
// ./src/client/shell/update/UpdateReducer.ts