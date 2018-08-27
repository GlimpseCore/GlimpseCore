const startTime = window.performance.now();

import 'babel-polyfill';
import 'event-source-polyfill';
import 'whatwg-fetch';
// tslint:disable-next-line:no-unused-variable
import React from 'react';
import ReactDOM from 'react-dom';

import greetMessage from './common/util/greetMessage';
import './common/util/UrlUtilities';
import store from './store';
import Root from './Root';
import { reportWindowOnError, reportConsoleErrorWrite } from './modules/errors/Errors';
import { setupRequestPurgeOldRecords } from './routes/requests/RequestsActions';
import { rootElement } from './common/init/getRootElement';
import { applyTheme } from './common/init/applyTheme';
import { setupUpdateChecker } from './shell/update/UpdateActions';
import { triggerRatingDialog } from './shell/rating-dialog/TriggerRatingDialog';
import { incrementSessionNumber } from './shell/sessionNumber/IncrementSessionNumber';

// Write the `Greetings message` to the `console`.
greetMessage(GLIMPSE_VERSION);
applyTheme();

let render = undefined;

import { initBatchingStrategyErrorHandling } from './modules/errors/BatchingStrategyHandler';

if (PRODUCTION) {
    initBatchingStrategyErrorHandling();
}

(function setupErrorHandlers() {
    const oldOnError = window.onerror;
    const oldConsoleError = console.error;

    window.onerror = function(messageOrEvent, source, lineno, colno, error, ...rest) {
        const message = error && error.message ? error.message : messageOrEvent;
        try {
            reportWindowOnError(source, lineno, colno, message, error);
        } catch (err2) {
            oldConsoleError.call(console, err2);
        }

        if (oldOnError) {
            oldOnError.call(this, messageOrEvent, source, lineno, colno, error, ...rest);
        }
    };

    if (!DEBUG) {
        console.error = function(message: string, ...rest) {
            if (oldConsoleError) {
                oldConsoleError.call(this, message, ...rest);
            }

            try {
                reportConsoleErrorWrite(message, rest);
            } catch (err2) {
                oldConsoleError.call(this, err2);
            }
        };
    }
})();

function triggerLoadAction(store) {
    const time = new Date();
    const data = {
        type: 'SHELL_LOADED',
        meta: {
            time: time.toUTCString(),
            timezone: time.getTimezoneOffset(),
            loadDuration: window.performance.now() - startTime
        }
    };
    store.dispatch(data);
    // TODO: this probably shouldn't be here... this should probably
    //       end up being redux middleware.
    setupRequestPurgeOldRecords(store.dispatch);
    setupUpdateChecker(store);
    // increment session number
    incrementSessionNumber(store);
    // check if Rating Dialog should be shown
    triggerRatingDialog(store);
}

if (FAKE_SERVER) {
    //tslint:disable:no-var-requires
    //require('fake/update/fake-update-actions');
    //require('fake/metadata/fake-metadata-actions');
    //require('fake/messages/fake-messages-actions');
    //tslint:enable:no-var-requires
}

if (HOT_RELOAD) {
    // // enable accessability checking
    // var a11y = require('react-a11y');
    // a11y(React, { throw: true, includeSrcNode: true, ReactDOM: ReactDOM });

    // live reload css files
    let counter = 0;
    window.addEventListener(
        'message',
        e => {
            if (!e.data.search || e.data.search('webpackHotUpdate') === -1) {
                return;
            }
            const links = document.getElementsByTagName('link');
            if (links.length > 1) {
                for (let i = 0; i < links.length - 1; i++) {
                    links[i].remove();
                }
            }
            const link = links[links.length - 1];
            const newLink = document.createElement('link');
            newLink.type = 'text/css';
            newLink.rel = 'stylesheet';
            newLink.href = link.href + (counter === 0 ? '?' : '') + counter++;
            newLink.onload = () => {
                link.remove();
            };
            link.parentNode.insertBefore(newLink, link.nextSibling);
        },
        false
    );

    // core render with hotload
    // tslint:disable-next-line:no-var-requires variable-name
    const { AppContainer } = require('react-hot-loader');
    // tslint:disable-next-line:variable-name
    render = function render(App) {
        const root = (
            <AppContainer>
                <App store={store} />
            </AppContainer>
        );
        ReactDOM.render(root, rootElement);
        triggerLoadAction(store);
    };
} else {
    // core render
    // tslint:disable-next-line:variable-name
    render = function render(App) {
        const root = <App store={store} />;
        ReactDOM.render(root, rootElement);
        triggerLoadAction(store);
    };
}

// render everything
render(Root);

// tslint:disable-next-line:no-any
if (HOT_RELOAD && (module as any).hot) {
    // tslint:disable-next-line:no-any
    (module as any).hot.accept('./modules/ModulesReducers', () => {
        const nextReducer = require('./modules/ModulesReducers').default;
        store.replaceReducer(nextReducer);
    });
    // tslint:disable-next-line:no-any
    (module as any).hot.accept('./Root', () => {
        const nextRoot = require('./Root').default;
        render(nextRoot);
    });
}



// WEBPACK FOOTER //
// ./src/client/index.tsx