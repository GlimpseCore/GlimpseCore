const startTime = window.performance.now();

import 'babel-polyfill';
import 'event-source-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';

import { triggerRatingDialog } from '@shell/rating-dialog/TriggerRatingDialog';
import { incrementSessionNumber } from '@shell/sessionNumber/IncrementSessionNumber';
import { setupUpdateChecker } from '@shell/update/UpdateActions';
import { applyTheme } from './common/init/applyTheme';
import { rootElement } from './common/init/getRootElement';
import greetMessage from './common/util/greetMessage';
import './common/util/UrlUtilities';
import { reportConsoleErrorWrite, reportWindowOnError } from './modules/errors/Errors';
import Root from './Root';
import { setupRequestPurgeOldRecords } from './routes/requests/RequestsActions';
import store from './store';

// Write the `Greetings message` to the `console`.
greetMessage(GLIMPSE_VERSION);
applyTheme();

let render;

import { initBatchingStrategyErrorHandling } from './modules/errors/BatchingStrategyHandler';

if (PRODUCTION) {
    initBatchingStrategyErrorHandling();
}

(function setupErrorHandlers() {
    const oldOnError = window.onerror;
    const oldConsoleError = console.error;

    window.onerror = function(messageOrEvent, source: string, lineno: number, colno:number, error: Error, ...rest) {
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
    // require('fake/update/fake-update-actions');
    // require('fake/metadata/fake-metadata-actions');
    // require('fake/messages/fake-messages-actions');
}

if (HOT_RELOAD) {
    // // enable accessability checking
    var a11y = require('react-a11y');
    a11y(React, { throw: true, includeSrcNode: true, ReactDOM: ReactDOM });

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
            const link : HTMLLinkElement = links[links.length - 1];
            const newLink = document.createElement('link');
            newLink.type = 'text/css';
            newLink.rel = 'stylesheet';
            newLink.href = link.href + (counter === 0 ? '?' : '') + counter++;
            newLink.onload = () => {
                link.remove();
            };
            (link.parentNode as Node).insertBefore(newLink, link.nextSibling);
        },
        false
    );

    // core render with hotload
    const { AppContainer } = require('react-hot-loader');
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
    render = function render(App) {
        const root = <App store={store} />;
        ReactDOM.render(root, rootElement);
        triggerLoadAction(store);
    };
}

// render everything
render(Root);

if (HOT_RELOAD && (module as any).hot) {
    (module as any).hot.accept('./modules/ModulesReducers', () => {
        const nextReducer = require('./modules/ModulesReducers').default;
        store.replaceReducer(nextReducer);
    });
    (module as any).hot.accept('./Root', () => {
        const nextRoot = require('./Root').default;
        render(nextRoot);
    });
}



// WEBPACK FOOTER //
// ./src/client/index.tsx