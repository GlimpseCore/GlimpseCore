import { Action, combineReducers } from 'redux';

import {
    selectExchangeAction,
    toggleStatusCodeClassAction,
    resetAllAction,
    toggleAgentAction
} from './ServiceActions';

import { IFilterValue, IServicePersistedRequestState, StatusCodeClass } from './ServiceInterfaces';
import { AgentType } from '../timeline/TimelineInterfaces';
import { getIntegersForEnum } from 'common/util/CommonUtilities';

const defaultAgentFiltersState = (() => {
    const state: IFilterValue = {};
    getIntegersForEnum(AgentType).forEach(n => {
        if (n !== AgentType.Other) {
            state[n] = true;
        }
    });
    return state;
})();

const defaultStatusCodeFiltersState = (() => {
    const state: IFilterValue = {};
    getIntegersForEnum(StatusCodeClass).forEach(n => {
        state[n] = true;
    });
    return state;
})();

function toggleFilter(
    filtersState: IFilterValue,
    targetFilter: AgentType | StatusCodeClass
): IFilterValue {
    const updatedFiltersState = Object.assign({}, filtersState);
    updatedFiltersState[targetFilter] = !updatedFiltersState[targetFilter];
    return updatedFiltersState;
}

function showAll(filtersState: IFilterValue, enumType: {}): IFilterValue {
    let allVisible = true;
    const nums = getIntegersForEnum(enumType);
    nums.forEach(v => {
        allVisible = allVisible && filtersState[v];
    });
    if (!allVisible) {
        const updatedFiltersState = {};
        nums.forEach(v => {
            updatedFiltersState[v] = true;
        });
        return updatedFiltersState;
    }
    return filtersState;
}

export function statusCodeFiltersReducer(
    state: IFilterValue = defaultStatusCodeFiltersState,
    action: Action
) {
    switch (action.type) {
        case toggleStatusCodeClassAction.type:
            return toggleFilter(state, toggleStatusCodeClassAction.unwrap(action));
        case resetAllAction.type:
            return showAll(state, StatusCodeClass);
        default:
            return state;
    }
}

export function agentFiltersReducer(
    state: IFilterValue = defaultAgentFiltersState,
    action: Action
) {
    switch (action.type) {
        case toggleAgentAction.type:
            return toggleFilter(state, toggleAgentAction.unwrap(action));
        case resetAllAction.type:
            return showAll(state, AgentType);
        default:
            return state;
    }
}

/**
 * The reducer for the persisted, non-request-specific service state
 */
export const servicePersistedReducer = combineReducers({
    filters: combineReducers({
        agent: agentFiltersReducer,
        statusCode: statusCodeFiltersReducer
    })
});

/**
 * The reducer for the persisted, request-specific service state
 */
export function servicePersistedRequestReducer(
    state: IServicePersistedRequestState = {},
    action: Action
): IServicePersistedRequestState {
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



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/service/ServiceReducers.ts