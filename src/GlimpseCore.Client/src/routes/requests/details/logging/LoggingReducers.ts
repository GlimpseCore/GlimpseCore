import { Action, combineReducers } from 'redux';

import { getIntegersForEnum } from '@common/util/CommonUtilities';

import { AgentType } from '../timeline/TimelineInterfaces';
import {
    ILoggingFilterValue,
    ILoggingExploredCategories,
    LoggingMessageLevel
} from './LoggingInterfaces';

import {
    showAllAction,
    toggleLevelAction,
    toggleAgentAction,
    addExploredCategoryAction,
    selectCategoryAction
} from './LoggingActions';

function toggleFilter(
    filtersState: ILoggingFilterValue,
    targetFilter: AgentType | LoggingMessageLevel
): ILoggingFilterValue {
    const updatedFiltersState = Object.assign({}, filtersState);
    updatedFiltersState[targetFilter] = !updatedFiltersState[targetFilter];
    return updatedFiltersState;
}

function showAll(filtersState: ILoggingFilterValue, enumType: {}): ILoggingFilterValue {
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

const defaultAgentFiltersState = (function createDefaultCategoryState() {
    const state: ILoggingFilterValue = {};
    getIntegersForEnum(AgentType).forEach(n => {
        if (n !== AgentType.Other) {
            state[n] = true;
        }
    });
    return state;
})();

const defaultLevelFiltersState = (function createDefaultCategoryState() {
    const state: ILoggingFilterValue = {};
    getIntegersForEnum(LoggingMessageLevel).forEach(n => {
        state[n] = true;
    });
    return state;
})();

const addExploredCategory = (
    state: ILoggingExploredCategories,
    newState: ILoggingExploredCategories
) => {
    // merge the old and the new categories
    return { ...state, ...newState };
};

export function levelFiltersReducer(
    state: ILoggingFilterValue = defaultLevelFiltersState,
    action: Action
) {
    switch (action.type) {
        case toggleLevelAction.type:
            return toggleFilter(state, toggleLevelAction.unwrap(action));
        case showAllAction.type:
            return showAll(state, LoggingMessageLevel);
        default:
            return state;
    }
}

export function agentFiltersReducer(
    state: ILoggingFilterValue = defaultAgentFiltersState,
    action: Action
) {
    switch (action.type) {
        case toggleAgentAction.type:
            return toggleFilter(state, toggleAgentAction.unwrap(action));
        case showAllAction.type:
            return showAll(state, AgentType);
        default:
            return state;
    }
}

/**
 * exploredCategoriesReducer - reducer to manage explored logging categories.
 *
 * @param  {ILoggingExploredCategories} state Current store state.
 * @param  {Action} action Action.
 * @return {ILoggingExploredCategories} new state.
 */
export function exploredCategoriesReducer(state: ILoggingExploredCategories = {}, action: Action) {
    switch (action.type) {
        case addExploredCategoryAction.type:
            return addExploredCategory(state, addExploredCategoryAction.unwrap(action));
        default:
            return state;
    }
}

export const selectedCategoryInitialState = 'All categories';

/**
 * selectedCategoryReducer - reducer to manage explored logging categories.
 *
 * @param  {ILoggingExploredCategories} state Current store state.
 * @param  {Action} action Action.
 * @return {ILoggingExploredCategories} new state.
 */
export function selectedCategoryReducer(state = selectedCategoryInitialState, action: Action) {
    const newCategory = addExploredCategoryAction.unwrap(action);

    switch (action.type) {
        case selectCategoryAction.type:
            return newCategory;

        case showAllAction.type:
            return selectedCategoryInitialState;

        default:
            return state;
    }
}

/**
 * Logging session reducer root.
 */
export const loggingSessionReducer = combineReducers({
    exploredCategories: exploredCategoriesReducer,
    selectedCategory: selectedCategoryReducer
});

/**
 * The reducer for the persisted, non-request-specific logging state
 */
export const loggingPersistedReducer = combineReducers({
    filters: combineReducers({
        level: levelFiltersReducer,
        agent: agentFiltersReducer
    })
});



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/logging/LoggingReducers.ts