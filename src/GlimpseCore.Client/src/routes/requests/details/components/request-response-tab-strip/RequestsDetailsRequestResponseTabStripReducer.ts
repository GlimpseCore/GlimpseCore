import { REQUESTS_DETAILS_REQUEST_RESPONSE_TAB_SELECTED } from './RequestResponseTabStripConstants';

const initialState = {
    route: {
        default: {
            requestTab: 'headers',
            responseTab: 'headers'
        }
    }
};

/**
 * The reducer for the persisted, non-request-specific selected request/response sub-tab state
 */
export function requestResponseTabStripPersistedReducer(state = initialState, action) {
    if (action.type === REQUESTS_DETAILS_REQUEST_RESPONSE_TAB_SELECTED) {
        return {
            route: {
                ...state.route,
                [action.detailAxis]: {
                    requestTab: action.requestAxis,
                    responseTab: action.responseAxis
                }
            }
        };
    }
    return state;
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/RequestsDetailsRequestResponseTabStripReducer.ts