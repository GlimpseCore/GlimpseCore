import { AgentType, TimelineEventCategory } from './TimelineInterfaces';
import {
    ITimelineFilterValue,
    ITimelineSelectedOffsetsState,
    ITimelineOffsetsActionConfig
} from './TimelineInterfaces';
import {
    resetAllAction,
    toggleCategoryAction,
    toggleAgentAction,
    selectOffsetsAction,
    resetOffsetsAction,
    highlightOffsetsAction,
    resetHighlightedOffsetsAction
} from './TimelineActions';
import { getIntegersForEnum } from 'common/util/CommonUtilities';
import { Action, combineReducers } from 'redux';

function toggleFilter(
    filtersState: ITimelineFilterValue,
    targetFilter: AgentType | TimelineEventCategory
): ITimelineFilterValue {
    const updatedFiltersState = Object.assign({}, filtersState);
    updatedFiltersState[targetFilter] = !updatedFiltersState[targetFilter];
    return updatedFiltersState;
}

function showAll(filtersState: ITimelineFilterValue, enumType: {}): ITimelineFilterValue {
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
    const state: ITimelineFilterValue = {};
    getIntegersForEnum(AgentType).forEach(n => {
        if (n !== AgentType.Other) {
            state[n] = true;
        }
    });
    return state;
})();

const defaultCategoryFiltersState = (function createDefaultCategoryState() {
    const state: ITimelineFilterValue = {};
    getIntegersForEnum(TimelineEventCategory).forEach(n => {
        state[n] = true;
    });
    return state;
})();

export function categoryFiltersReducer(
    state: ITimelineFilterValue = defaultCategoryFiltersState,
    action: Action
) {
    switch (action.type) {
        case toggleCategoryAction.type:
            return toggleFilter(state, toggleCategoryAction.unwrap(action));
        case resetAllAction.type:
            return showAll(state, TimelineEventCategory);
        default:
            return state;
    }
}

export function agentFiltersReducer(
    state: ITimelineFilterValue = defaultAgentFiltersState,
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

function selectOffsets(
    state: ITimelineSelectedOffsetsState,
    data: ITimelineOffsetsActionConfig
): ITimelineSelectedOffsetsState {
    const { minOffset, maxOffset, segment } = data;

    return minOffset !== state.minOffset || maxOffset !== state.maxOffset
        ? {
              ...state,
              minOffset,
              maxOffset,
              segment
          }
        : state;
}

function highlightOffsets(
    state: ITimelineSelectedOffsetsState,
    data: ITimelineOffsetsActionConfig
): ITimelineSelectedOffsetsState {
    const { minOffset, maxOffset } = data;

    return minOffset !== state.highlightedMinOffset || maxOffset !== state.highlightedMaxOffset
        ? {
              ...state,
              highlightedMinOffset: minOffset,
              highlightedMaxOffset: maxOffset
          }
        : state;
}

function resetHighlightedOffsets(
    state: ITimelineSelectedOffsetsState
): ITimelineSelectedOffsetsState {
    return {
        ...state,
        highlightedMinOffset: undefined,
        highlightedMaxOffset: undefined
    };
}

export const initialTimelineSelectedOffsetsState: ITimelineSelectedOffsetsState = {
    minOffset: undefined,
    maxOffset: undefined,
    highlightedMinOffset: undefined,
    highlightedMaxOffset: undefined,
    segment: 'reset'
};

function resetOffsets(state: ITimelineSelectedOffsetsState): ITimelineSelectedOffsetsState {
    const { minOffset, maxOffset, segment } = state;

    return minOffset !== undefined || maxOffset !== undefined || segment !== 'reset'
        ? initialTimelineSelectedOffsetsState
        : state;
}

export function selectedOffsetsReducer(
    state: ITimelineSelectedOffsetsState = initialTimelineSelectedOffsetsState,
    action: Action
): ITimelineSelectedOffsetsState {
    switch (action.type) {
        case selectOffsetsAction.type:
            return selectOffsets(state, selectOffsetsAction.unwrap(action));
        case resetOffsetsAction.type:
            return resetOffsets(state);
        case highlightOffsetsAction.type:
            return highlightOffsets(state, highlightOffsetsAction.unwrap(action));
        case resetHighlightedOffsetsAction.type:
            return resetHighlightedOffsets(state);
        default:
            return state;
    }
}

/**
 * The reducer for the persisted, non-request-specific timeline state
 */
export const timelinePersistedReducer = combineReducers({
    filters: combineReducers({
        category: categoryFiltersReducer,
        agent: agentFiltersReducer
    })
});

/**
 * The reducer for the persisted, request-specific timeline state
 */
export const timelinePersistedRequestReducer = combineReducers({
    selectedOffsets: selectedOffsetsReducer
});



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/TimelineReducers.ts