import { combineReducers } from 'redux';
import { routerReducer as reduxRouterReducer } from 'react-router-redux';

import logSlowReducers from 'redux-log-slow-reducers';
import { persistReducerState, retrieveReducerState } from './common/util/ReducerUtilities';

import modulesReducers from './modules/ModulesReducers';
import routesReducers from './routes/RoutesReducers';
import { requestsPersistedRequestReducer } from './routes/requests/RequestsReducers';
import { themesPersistedReducer } from './shell/themes/ThemesReducer';
import { updatePersistedReducer } from './shell/update/UpdateReducer';
import { smileyFeedbackReducer } from './shell/feedback/SmileyFeedbackReducer';
import { debugSessionReducer } from './shell/debug/DebugReducer';
import { loggingSessionReducer } from './routes/requests/details/logging/LoggingReducers';
import { saveSizeReducer } from './common/components/resize/ResizeReducers';
import { ratingDialogReducer } from './shell/rating-dialog/RatingDialogReducer';
import { sessionNumberReducer } from './shell/sessionNumber/SessionNumberReducer';

export const stateKey = 'GlimpseAppState';

export const sessionReducer = combineReducers({
    ...modulesReducers,
    debug: debugSessionReducer,
    routing: reduxRouterReducer,
    logging: loggingSessionReducer
});

export const persistedReducer = combineReducers({
    global: combineReducers({
        ...routesReducers,
        themes: themesPersistedReducer,
        update: updatePersistedReducer,
        smileyFeedback: smileyFeedbackReducer,
        ratingDialog: ratingDialogReducer,
        resizePanels: saveSizeReducer,
        sessionNumber: sessionNumberReducer
    }),
    requests: requestsPersistedRequestReducer
});

export function buildReducers() {
    let rawReducers = {
        session: sessionReducer,
        persisted: persistReducerState(persistedReducer, stateKey)
    };

    if (DEBUG) {
        // log out slow reducers
        rawReducers = logSlowReducers(rawReducers);
    }

    return combineReducers(rawReducers);
}

export function buildInitialState() {
    return {
        session: undefined,
        persisted: retrieveReducerState(stateKey)
    };
}



// WEBPACK FOOTER //
// ./src/client/Reducers.ts