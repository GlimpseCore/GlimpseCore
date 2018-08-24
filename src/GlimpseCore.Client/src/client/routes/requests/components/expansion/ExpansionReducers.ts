import { setExpansionAction } from './ExpansionActions';
import { ExpandedState, IExpansionPersistedState } from './IExpansionPersistedState';
import { Action } from 'redux';

const initialState = {
    elements: {}
};

function isExpanded(expanded: ExpandedState): boolean {
    return expanded === ExpandedState.Expanded || expanded === ExpandedState.ExpandAll;
}

function createState(
    elements: { [key: string]: IExpansionPersistedState },
    expanded: ExpandedState
): IExpansionPersistedState {
    const state: IExpansionPersistedState = {
        elements
    };

    if (expanded !== undefined) {
        state.expanded = expanded;
    }

    return state;
}

export function getExpansion(
    state: IExpansionPersistedState,
    elementId: string[],
    defaultValue: ExpandedState = ExpandedState.Collapsed
): boolean {
    const [currentElementId, ...rest] = elementId;

    if (currentElementId) {
        const currentElement = state.elements[currentElementId];

        if (currentElement) {
            // NOTE: A parent's expand- and collapse-all state overrides any existing default value.
            //       This allows us to force expand an element normally collapsed by default and vice-versa.
            const newDefaultValue = currentElement.expanded === ExpandedState.ExpandAll ||
                currentElement.expanded === ExpandedState.CollapseAll
                ? currentElement.expanded
                : defaultValue;

            return getExpansion(currentElement, rest, newDefaultValue);
        } else {
            return isExpanded(defaultValue);
        }
    } else {
        return state.expanded !== undefined ? isExpanded(state.expanded) : isExpanded(defaultValue);
    }
}

function setExpansion(
    state: IExpansionPersistedState,
    elementId: string[],
    expanded?: ExpandedState
): IExpansionPersistedState {
    const [currentElementId, ...rest] = elementId;

    if (currentElementId) {
        const currentElement = state.elements[currentElementId] || initialState;
        const newElement = setExpansion(currentElement, rest, expanded);

        if (currentElement === newElement) {
            // The state hasn't actually changed, so return the existing state...
            return state;
        } else {
            // Return a copy of the existing state but with a new elements map with the updated element...
            return createState(
                { ...state.elements, [currentElementId]: newElement },
                state.expanded
            );
        }
    } else {
        if (expanded === ExpandedState.ExpandAll || expanded === ExpandedState.CollapseAll) {
            // Expanding- or collapsing-all resets the state of any children so return just the new expanded state...
            return createState({}, expanded);
        } else if (state.expanded === expanded) {
            // The state hasn't actually changed, so return the existing state...
            return state;
        } else {
            // Return a copy of the existing state but with the new expansion value...
            return createState(state.elements, expanded);
        }
    }
}

export default function expansion(
    state: IExpansionPersistedState = initialState,
    action: Action
): IExpansionPersistedState {
    switch (action.type) {
        case setExpansionAction.type:
            const payload = setExpansionAction.unwrap(action);

            return setExpansion(state, payload.elementId, payload.expanded);

        default:
            return state;
    }
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/expansion/ExpansionReducers.ts