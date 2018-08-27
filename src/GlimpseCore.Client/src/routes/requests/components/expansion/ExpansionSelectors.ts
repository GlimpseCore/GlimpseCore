import { createSelector } from 'reselect';

import { getExpansion } from './ExpansionReducers';
import { ExpandedState, IExpansionPersistedState } from './IExpansionPersistedState';
import { getSelectedRequestPersistedState } from '@routes/requests/RequestsSelector';

const defaultState: IExpansionPersistedState = {
    elements: {}
};

export const getExpansionState = createSelector(
    getSelectedRequestPersistedState,
    selectedRequestState => {
        if (selectedRequestState && selectedRequestState.expansion) {
            return selectedRequestState.expansion;
        }

        return defaultState;
    }
);

/*
 * Returns the stored expansion state of a given element.
 *
 * NOTE: This is just a thin wrapper of the reducer getExpansion() so that container
 *       components can follow the convention of using a "selector".
 */
export function isExpanded(
    state: IExpansionPersistedState,
    elementId: string[],
    defaultValue: boolean = false
): boolean {
    return getExpansion(
        state,
        elementId,
        defaultValue ? ExpandedState.Expanded : ExpandedState.Collapsed
    );
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/expansion/ExpansionSelectors.ts