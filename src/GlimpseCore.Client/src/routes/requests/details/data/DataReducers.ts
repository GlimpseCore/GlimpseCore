import {
    selectExchangeAction,
    showAllAction,
    toggleDatabaseFilterAction,
    toggleOperationFilterAction
} from './DataActions';

import {
    DataOperationType,
    DataDatabaseType,
    IDataFilterState,
    IDataPersistedRequestState
} from './DataInterfaces';

import { getNamesForEnum } from '@common/util/CommonUtilities';

import { Action, combineReducers } from 'redux';

import values from 'lodash/values';
import mapValues from 'lodash/mapValues';

/**
 * The reducer for the persisted, request-specific data state
 */
export function dataPersistedRequestReducer(
    state: IDataPersistedRequestState = {},
    action: Action
): IDataPersistedRequestState {
    switch (action.type) {
        case selectExchangeAction.type:
            const { selectedExchangeId: prevSelectedExchangeId } = state;
            const { exchangeId: newSelectedExchangeId } = selectExchangeAction.unwrap(action);

            return newSelectedExchangeId !== prevSelectedExchangeId
                ? { ...state, selectedExchangeId: newSelectedExchangeId }
                : state;
        default:
            return state;
    }
}

function toggleFilter(state: IDataFilterState, name: string): IDataFilterState {
    const currentValue = state[name];
    const newState = { ...state };

    newState[name] = currentValue !== undefined ? !currentValue : false;

    return newState;
}

function showAllFilters(state: IDataFilterState): IDataFilterState {
    if (values(state).some(filter => !filter)) {
        return mapValues(state, filter => true);
    } else {
        return state;
    }
}

export const createDefaultFilterState = filterStates => {
    const state = {};
    getNamesForEnum(filterStates).forEach(n => {
        state[n] = true;
    });
    return state;
};

export function databaseFiltersReducer(
    state: { [key: string]: boolean } = createDefaultFilterState(DataDatabaseType),
    action: Action
) {
    switch (action.type) {
        case toggleDatabaseFilterAction.type:
            return toggleFilter(state, toggleDatabaseFilterAction.unwrap(action));
        case showAllAction.type:
            return showAllFilters(state);
        default:
            return state;
    }
}

export function operationFiltersReducer(
    state: { [key: string]: boolean } = createDefaultFilterState(DataOperationType),
    action: Action
) {
    switch (action.type) {
        case toggleOperationFilterAction.type:
            return toggleFilter(state, toggleOperationFilterAction.unwrap(action));
        case showAllAction.type:
            return showAllFilters(state);
        default:
            return state;
    }
}

/**
 * The reducer for the persisted, non-request-specific data state
 */
export const dataPersistedReducer = combineReducers({
    filters: combineReducers({
        database: databaseFiltersReducer,
        operation: operationFiltersReducer
    })
});



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataReducers.ts