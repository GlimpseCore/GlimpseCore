import { applyMiddleware, createStore, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';

import { browserHistory } from './history';
import { buildReducers, buildInitialState } from './Reducers';

import telemetryClient from './modules/telemetry/TelemetryClient';
import reduxMiddlewareTelemetryListener from './modules/telemetry/ReduxMiddlewareTelemetryListener';
import { reportReduxException } from './modules/errors/Errors';
import { storeInitAction } from './StoreActions';
import { cleanupPersistedGlobal } from './common/util/CleanupObjectKeys';

// hook up middleware for telemetry reporting
const analyticsMiddleware = telemetryClient.createTelemetryMiddleware();
const telemetryMiddleware = reduxMiddlewareTelemetryListener.createTelemetryMiddleware();
const reduxImmutableStateInvariant = require('redux-immutable-state-invariant');

// redux middleware that will report any exceptions occuring when selectors are run
const crashReporter = store => next => action => {
    try {
        return next(action);
    } catch (err) {
        reportReduxException(action.type, err);
        throw err;
    }
};

// setting up middleware
const middleware = DEBUG
    ? applyMiddleware(
          crashReporter,
          reduxImmutableStateInvariant.default(), // tslint:disable-line:no-var-requires
          routerMiddleware(browserHistory),
          thunk,
          analyticsMiddleware,
          telemetryMiddleware
      ) // NOTE: this is slow!!!
    : applyMiddleware(
          crashReporter,
          routerMiddleware(browserHistory),
          thunk,
          analyticsMiddleware,
          telemetryMiddleware
      );
const enhancers = DEBUG
    ? compose(
          middleware,
          (window as any).devToolsExtension // tslint:disable-line:no-any
              ? (window as any).devToolsExtension() // tslint:disable-line:no-any
              : f => f
      )
    : middleware;

// get the state from the localstorage
const persistedState = buildInitialState();
// get a `default` state and make sure the `persisted` state `conforms` the expected structure
const defaultState = createStore(buildReducers(), {}, enhancers).getState();
// clean up persisted state
const cleanPersistedState = cleanupPersistedGlobal(defaultState, persistedState);

// create store with the clean state structure
const store = createStore(buildReducers(), cleanPersistedState, enhancers);

store.dispatch(storeInitAction());

export default store;



// WEBPACK FOOTER //
// ./src/client/store.ts