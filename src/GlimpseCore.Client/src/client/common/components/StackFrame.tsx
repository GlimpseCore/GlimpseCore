// tslint:disable-next-line:no-unused-variable
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import * as Glimpse from '@glimpse/glimpse-definitions';

import { isLocalhost } from 'common/util/UrlUtilities';
import { stopPropagation } from 'common/util/CommonUtilities';
import { getConfig } from 'modules/metadata/MetadataSelectors';

import { IStoreState } from 'client/IStoreState';

import styles from './StackFrame.scss';
import commonStyles from './Common.scss';

export interface IStackFrameProps {
    enableOpenInVSCode?: boolean;
    frame: {
        fileName?: string;
        lineNumber?: number;
        columnNumber?: number;
    };
}

/**
 * isNetworkServed - function to check whether
 *                   a filename has `https?://` at the beginning.
 *
 * @param {String} filename Filename to check.
 * @returns {Boolean} If the string contains `https?://` at the beginning.
 */
const isNetworkServed = (filename: string): boolean => {
    return /^((http|https):\/\/)/.test(filename);
};

const stackFrame = (props: IStackFrameProps) => {
    const { frame, enableOpenInVSCode } = props;

    if (frame) {
        const { fileName } = frame;
        const isClientSide = isNetworkServed(fileName);

        if (fileName) {
            const file = getFileFromPath(fileName);
            // get line and column numbers formatted with `:line:column`
            const postfix = getFrameLineAndColumnPostFix(frame);
            // get common contents with filename and optional `:line:column` postfix
            const contents = (
                <span>
                    <span className={styles.stackFrameFileName}>{file}</span>
                    <span className={styles.stackFrameLineNumber}>{postfix}</span>
                </span>
            );
            const fileWithPostfix = `${fileName}${postfix}`;
            // if `localhost` and not `client side script` (we do not have the real path yet)
            // then enable source file link, otherwise use `span`
            if (!isClientSide && enableOpenInVSCode) {
                return (
                    <a
                        onClick={stopPropagation}
                        className={classNames(styles.stackFrame, commonStyles.link)}
                        title={`Open ${fileWithPostfix} in VS Code`}
                        href={`vscode://file/${fileName}${postfix}`}>
                        {contents}
                    </a>
                );
            } else {
                return (
                    <span className={styles.stackFrame} title={`${fileWithPostfix}`}>
                        {contents}
                    </span>
                );
            }
        }
    }

    return <span>-</span>;
};

/**
 *  getFrameLineAndColumnPostFix - method to create the `:line:column` postfix,
 *                              if the line and column defined,
 *                              otherwise empty string will be returned.
 *
 * @param {Object} frame Frame.
 * @returns {String} The :line:column postfix.
 */
export function getFrameLineAndColumnPostFix(
    frame: Glimpse.Messages.Payloads.Mixin.ICallStackFrame
): string {
    const { lineNumber, columnNumber } = frame;

    let postfix = '';
    // if `line number` is present add it to the postfix
    if (lineNumber !== undefined) {
        postfix += `:${lineNumber}`;
        // if `column number` is present add it to the postfix
        if (columnNumber) {
            postfix += `:${columnNumber}`;
        }
    }

    return postfix;
}

/**
 * given a path, return the "file-name" portion. Public for test purposes.
 */
export function getFileFromPath(fileName: string): string {
    let f = fileName;
    if (f) {
        let idx1 = fileName.lastIndexOf('/');
        let idx2 = fileName.lastIndexOf('\\');

        let start = idx1 + 1;
        if (idx1 === -1 && idx2 > -1) {
            // back-slash & no forward-slash.
            start = idx2 + 1;
        }

        let end = fileName.length;
        let hidx = fileName.indexOf('#', start);
        let qidx = fileName.indexOf('?', start);
        if (hidx > -1) {
            end = hidx;
        }
        if (qidx > -1 && qidx < hidx) {
            end = qidx;
        }

        f = fileName.substring(start, end);
        f = f.replace(/\:\d+/gim, '');
    }
    return f;
}

function mapStateToProps(state: IStoreState, props) {
    const enableOpenInVSCodeSetting = getConfig(state)['feature.open-in-vscode.enabled'];

    return {
        enableOpenInVSCode: enableOpenInVSCodeSetting && isLocalhost()
    };
}

export default connect(mapStateToProps)(stackFrame);

export { stackFrame as StackFrame };



// WEBPACK FOOTER //
// ./src/client/common/components/StackFrame.tsx