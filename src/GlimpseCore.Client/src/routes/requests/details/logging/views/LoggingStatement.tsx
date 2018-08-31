import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import styles from './LoggingStatement.scss'; // tslint:disable-line:no-unused-variable
import JsonTree from '@routes/requests/components/JsonTree';

/* tslint:disable:no-var-requires */
import sprintfjs from '@common/util/printf';
const ansiHTML = require('ansi-html');
const emojione = require('emojione');
const autolinker = require('autolinker');
const escapeHtml = require('escape-html');
const store = require('client/store').default;
/* tslint:enable:no-var-requires */

export interface ILoggingStatementProps {
    content;
    tokenSupport?: string;
    contextId: string;
    messageId: string;
}

// emojione settings
emojione.imageType = 'svg';
const shortnames = emojione.shortnames.replace(/\:[0-9]+\:\|?/g, ''); // Remove shortcodes that look like line numbers
emojione.regShortNames = new RegExp(
    '<object[^>]*>.*?</object>|<a[^>]*>.*?</a>|<(?:object|embed|svg|img|div|p|a)[^>]*>|(' +
        shortnames +
        ')',
    'gi'
);
emojione.regUnicode = new RegExp(
    '<object[^>]*>.*?</object>|<a[^>]*>.*?</a>|<(?:object|embed|svg|img|div|p|a)[^>]*>|(' +
        emojione.unicodeRegexp +
        ')',
    'gi'
);
//emojione.imagePathSVG = ''; Set this to make path local

// linker settigns
const linkerOptions = { newWindow: true, phone: false, mention: false, hashtag: false };

function process(content, tokenSupport: string, contextId: string, messageId: string) {
    let contentObj = undefined;
    // intial pass if sprintfjs if needed
    if (content.constructor === Array) {
        contentObj = sprintfjs(content[0], content.slice(1, content.length), tokenSupport);

        // Note: Sad about this, wish I didn't have to do this. We are switching
        //       here from a dom object to a string containing the html... the reason
        //       we have to do this, is that the downstream processors only work
        //       with strings, not dom elements. From a perf perspective it would
        //       be nice to keep it as a dom object all the way through.
        content = contentObj.formattedResult.innerHTML;
    } else {
        // this case is a fall back for people with malformed messages
        content = escapeHtml(String(content));
    }

    // additional pass to linkify, emojify and ansify
    // NOTE: random perf problems occur in here, hence perf tracking
    // NOTE: this is running in a specific order. If you switch things
    //       around things will break in various edge cases. For instance
    //       if emoji went first then linker, linker would try and convert
    //       the emoji urls in the image tags to links.
    let parsed = autolinker.link(content, linkerOptions);
    parsed = emojione.toImage(parsed);
    parsed = ansiHTML(parsed);

    // setup holder which we can work with
    const contentElement = document.createElement('span');
    contentElement.innerHTML = parsed;
    // the `styles.statement` is needed to apply the
    // `:global` styles from the `scss` file
    contentElement.className = `logStatement ${styles.statement}`;

    // additional inject objects if needed
    if (contentObj && contentObj.objects) {
        for (const objectKey in contentObj.objects) {
            if (objectKey) {
                const node = contentElement.querySelector(
                    'span[data-glimpse-object="' + objectKey + '"]'
                );
                ReactDOM.render(
                    <Provider store={store}>
                        <JsonTree
                            data={contentObj.objects[objectKey]}
                            elementId={['logs', messageId, objectKey]}
                            requestId={contextId}
                        />
                    </Provider>,
                    node
                );
            }
        }
    }

    return contentElement;
}

export default class LoggingStatement extends React.Component<ILoggingStatementProps, {}> {
    public refs: {
        [string: string]: any; // tslint:disable-line:no-any
        target: any; // tslint:disable-line:no-any
    };
    public componentDidMount() {
        const { content, tokenSupport, contextId, messageId } = this.props;
        // tslint:disable-next-line:no-null-keyword
        if (content !== undefined || content !== null) {
            const result = process(content, tokenSupport, contextId, messageId);
            this.refs.target.appendChild(result);
        }
    }
    public render() {
        const { content } = this.props;
        // tslint:disable-next-line:no-null-keyword
        if (content !== undefined || content !== null) {
            return <span ref="target" />;
        } else {
            return undefined;
        }
    }
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/logging/views/LoggingStatement.tsx