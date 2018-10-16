import { Action } from 'redux';
import Perf from 'react-addons-perf';

import { IDebugState } from './IDebugState';
import { toggleDebugEnabled } from './DebugActions';

const initialState = {
    enabled: false
};

/**
 * The reducer for the session (i.e. non-persisted) state related to the application's debugging settings
 *
 * @param state The previous state
 * @param action An action to manipulate state
 *
 * @returns The new state
 */
export function debugSessionReducer(state: IDebugState = initialState, action: Action) {
    switch (action.type) {
        case toggleDebugEnabled.type:
            const enabled = !state.enabled;
            if (enabled) {
                Perf.start();
            } else {
                Perf.stop();
                const m = Perf.getLastMeasurements();
                console.log('[PERF] React printWasted:');
                Perf.printWasted(m);
                console.log('[PERF] React printInclusive:');
                Perf.printInclusive(m);
                console.log('[PERF] React printExclusive:');
                Perf.printExclusive(m);
            }

            return {
                enabled
            };
        default:
            return state;
    }
}



// WEBPACK FOOTER //
// ./src/client/shell/debug/DebugReducer.ts