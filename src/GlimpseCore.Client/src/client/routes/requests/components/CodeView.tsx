import React from 'react';
import beautify from 'js-beautify';
import classNames from 'classnames';

import { isObject } from 'common/util/CommonUtilities';
import { convertToObject } from 'common/util/ObjectUtilities';

import styles from './CodeView.scss';
import Highlight from 'react-highlight';
import JsonTree from './JsonTree';

export interface ICodeViewProps {
    elementId?: string[];
    requestId?: string;
    language: string;
    code: string;
    className?: string;
}

export class CodeView extends React.Component<ICodeViewProps, {}> {
    public refs: {
        target: any; // tslint:disable-line:no-any
    };

    public componentDidUpdate() {
        this.processCodeBlocks(this.refs.target);
    }

    public componentDidMount() {
        this.processCodeBlocks(this.refs.target);
    }

    public render() {
        const { elementId, requestId } = this.props;
        let { language, code } = this.props;

        // when we have json we want to use the JsonTree control
        if (language === 'json') {
            const codeObj = isObject(code) ? code : convertToObject(code);
            if (codeObj) {
                return (
                    <JsonTree
                        data={codeObj}
                        forceExpandRoot={true}
                        elementId={elementId}
                        requestId={requestId}
                    />
                );
            } else {
                // we couldn't get an object from the string, so clear out the language & fall through to the default case below
                language = '';
            }
        }

        if (language === 'xml') {
            // note, html from a lang perspective is treated as XML, hence
            //       why the html beautify is used.
            code = beautify.html_beautify(code, {
                indent_size: 2,
                extra_liners: [],
                preserve_newlines: false
            });
        } else if (language === 'css') {
            code = beautify.css_beautify(code, { indent_size: 2 });
        } else if (language === 'javascript') {
            code = beautify.js_beautify(code, { indent_size: 2 });
        }

        return (
            <div className={classNames(styles.codeView, this.props.className)} ref="target">
                <Highlight className={language}>{code}</Highlight>
            </div>
        );
    }

    private processCodeBlocks(target) {
        if (target && target.querySelectorAll) {
            let blocks = target.querySelectorAll('code');
            // convert array like `node list` to real array, thus `forEach`
            // will be available
            blocks = Array.prototype.slice.call(blocks, 0);

            blocks.forEach(block => {
                if (block.classList.contains('hljs-line-numbers')) {
                    block.remove();
                } else {
                    // NOTE: core line number logic leveraged from highlightjs-line-numbers.js
                    //       https://github.com/wcoder/highlightjs-line-numbers.js under MIT license
                    this.lineNumbersBlock(block);
                }
            });
        }
    }

    private lineNumbersBlock(element) {
        if (typeof element === 'object') {
            const parent = element.parentNode;
            const lines = this.getCountLines(parent.textContent);

            if (lines > 0) {
                let l = '';
                for (let i = 0; i < lines; i++) {
                    l += i + 1 + '\n';
                }

                const linesPanel = document.createElement('code');
                linesPanel.className = 'hljs hljs-line-numbers';
                linesPanel.style.cssFloat = 'left';
                linesPanel.textContent = l;

                parent.insertBefore(linesPanel, element);
            }
        }
    }

    private getCountLines(text) {
        if (text.length > 0) {
            const regExp = /\r\n|\r|\n/g;
            let lines = text.match(regExp);
            lines = lines ? lines.length : 0;

            if (!text[text.length - 1].match(regExp)) {
                lines += 1;
            }

            return lines;
        }
    }
}

export default CodeView;



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/CodeView.tsx