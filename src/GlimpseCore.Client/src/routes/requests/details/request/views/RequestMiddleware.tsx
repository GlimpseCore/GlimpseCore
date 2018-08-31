import classNames from 'classnames';
import * as Glimpse from '@glimpse/glimpse-definitions';
import React from 'react';
import { connect } from 'react-redux';
import { messageTargetId } from '@client/common/util/CommonUtilities';

import { trainCase } from '@common/util/StringUtilities';
import {
    getMiddleware,
    IFlattenedMiddleware,
    IFlattenedMiddlewareOperation,
    IResponseHeaderOperation,
    ResponseHeaderOperationType
} from '../RequestMiddlewareSelectors';
import { IStoreState } from '@client/IStoreState';
import {
    parseResponseCookie,
    IResponseCookie
} from '@routes/requests/details/components/request-response-tab-strip/cookies/CookieUtils';

import styles from './RequestMiddleware.scss';
import commonStyles from '@common/components/Common.scss';
import messageRowTargetStyles from '@common/components/MessageRowTarget.scss';
import StatusLabel from '@common/components/StatusLabel';
import StackFrame from '@common/components/StackFrame';

interface IMiddlewareViewProps {
    middleware: IFlattenedMiddleware[];
}

interface IMiddlewareModifiedItem {
    operationTypeText: string;
    nameText?: string;
    value: JSX.Element;
    wasOverwritten: boolean;
}

function createValueText(operation: IFlattenedMiddlewareOperation, value: string): JSX.Element {
    // If no value text was provided, force whitespace to preserve row alignment...
    return value && value.length > 0
        ? <span
              title={value}
              className={classNames({ [commonStyles.paramOverwritten]: !operation.isCurrent })}>
              {value}
          </span>
        : <span>&nbsp;</span>;
}

// Returns a hash of the cookie's name and domain for identifying cookies that have been modified.
// This addresses the scenario of two cookies with the same name but different domains, as they
// should be treated as disparate cookies.
function getCookieHash(cookie: IResponseCookie): string {
    const { name, domain = '', path = '' } = cookie;

    return [name, domain, path].join(';');
}

export class MiddlewareView extends React.Component<IMiddlewareViewProps, {}> {
    public render() {
        const middleware = this.props.middleware;

        let content;
        if (middleware.length === 0) {
            content = (
                <tr>
                    <td colSpan={5} className={commonStyles.tableNoData}>No middleware detected</td>
                </tr>
            );
        } else {
            content = middleware.map((middlewareRow, index) =>
                this.renderRow(index + 1, middlewareRow)
            );
        }

        return (
            <div className={styles.middleware}>
                <div className={styles.middlewareTitle}>
                    <h3 className={commonStyles.detailTitle}>Application middleware</h3>
                </div>
                <table className={commonStyles.table}>
                    <thead>
                        <tr>
                            <th width="20" title="#">#</th>
                            <th width="20%" title="Name">Name</th>
                            <th width="15%" title="Package">Package</th>
                            <th width="20%" title="Modified">Modified</th>
                            <th className={styles.middlewareValueHeader} title="Value">Value</th>
                            <th width="12%" title="Registered at">Registered at</th>
                        </tr>
                        <tr><td colSpan={6} className={commonStyles.tableHeadSpacer} /></tr>
                    </thead>
                    <tbody className={styles.middlewareBody}>
                        {content}
                    </tbody>
                </table>
            </div>
        );
    }

    private renderRow(ordinal: number, middleware: IFlattenedMiddleware) {
        const modifiedItems = this.createModifiedItems(middleware.operations);

        return (
            <tr
                key={ordinal}
                id={messageTargetId(middleware.id)}
                className={classNames(
                    messageRowTargetStyles.messageRowTargetContainer,
                    commonStyles.tableSelectableRow
                )}>
                <td><span title={ordinal.toString()}>{ordinal}</span></td>
                <td>{this.renderName(middleware.name, middleware.depth)}</td>
                <td className={commonStyles.trimText}>
                    {this.renderPackageName(middleware.packageName)}
                </td>
                <td className={commonStyles.trimText}>{this.renderModified(modifiedItems)}</td>
                <td className={commonStyles.trimText}>{this.renderValue(modifiedItems)}</td>
                <td><StackFrame frame={middleware.location} /></td>
            </tr>
        );
    }

    private renderPackageName(packageName: string) {
        if (packageName !== undefined && packageName.length) {
            return <span title={packageName}>{packageName}</span>;
        } else {
            return <span className={styles.middlewareNameAnonymous}>-</span>;
        }
    }

    private createModifiedItems(
        operations: IFlattenedMiddlewareOperation[]
    ): IMiddlewareModifiedItem[] {
        const modifiedItems: IMiddlewareModifiedItem[] = [];
        // This mapping keeps track of the last modified cookies by
        // overwriting (mutating) the most recently visited cookie
        const lastModifiedCookiesMap: { [key: string]: IMiddlewareModifiedItem } = {};

        operations.forEach(operation => {
            switch (operation.operation.type) {
                case Glimpse.Messages.Payloads.Middleware.End.Definitions.ResponseBodyOperationType:
                    modifiedItems.push({
                        operationTypeText: 'Body',
                        value: createValueText(operation, undefined),
                        wasOverwritten: !operation.isCurrent
                    });

                    break;

                case ResponseHeaderOperationType:
                    const responseHeaderOperation = operation.operation as IResponseHeaderOperation;
                    const isCookie = responseHeaderOperation.name.toLowerCase() === 'set-cookie';
                    const operationTypeText = isCookie ? 'Cookie: ' : 'Header: ';

                    responseHeaderOperation.values.forEach(value => {
                        const cookie: IResponseCookie = isCookie
                            ? parseResponseCookie(value)
                            : undefined;

                        const modifiedItem = {
                            operationTypeText,
                            nameText: isCookie
                                ? cookie.name
                                : trainCase(responseHeaderOperation.name),
                            value: createValueText(operation, value),
                            wasOverwritten: isCookie
                                ? true // temporarily set all cookies as overwritten
                                : !operation.isCurrent
                        };

                        if (isCookie) {
                            lastModifiedCookiesMap[getCookieHash(cookie)] = modifiedItem;
                        }

                        modifiedItems.push(modifiedItem);
                    });

                    break;

                case Glimpse.Messages.Payloads.Middleware.End.Definitions
                    .ResponseStatusCodeOperationType:
                    const responseStatusCodeOperation = operation.operation as Glimpse.Messages.Payloads.Middleware.End.Definitions.IResponseStatusCode;

                    modifiedItems.push({
                        operationTypeText: 'Status Code',
                        value: (
                            <div className={styles.middlewareStatusCode}>
                                <StatusLabel statusCode={responseStatusCodeOperation.statusCode} />
                            </div>
                        ),
                        wasOverwritten: !operation.isCurrent
                    });

                    break;

                default:
                    break;
            }
        });

        // set all of the last modified cookies as not overwritten
        Object.keys(lastModifiedCookiesMap).forEach(cookieName => {
            lastModifiedCookiesMap[cookieName].wasOverwritten = false;
        });

        return modifiedItems;
    }

    private renderName(name: string, depth: number) {
        const isAnonymous = name === undefined || name.length === 0 || name === '<anonymous>';
        const displayName = isAnonymous ? '[anonymous]' : name;

        return (
            <div className={commonStyles.trimText}>
                <span
                    className={classNames({ [styles.middlewareNameAnonymous]: isAnonymous })}
                    title={displayName}>
                    {displayName}
                </span>
            </div>
        );
    }

    private renderModified(modifiedItems: IMiddlewareModifiedItem[]) {
        if (modifiedItems.length) {
            return (
                <div className={styles.middlewareList}>
                    {modifiedItems.map((item, index) => {
                        const annotationText = item.nameText
                            ? item.operationTypeText + item.nameText
                            : item.operationTypeText;

                        return (
                            <div
                                key={index}
                                className={styles.middlewareOperation}
                                title={annotationText}>
                                <span className={commonStyles.trimText}>
                                    <span className={styles.middlewareOperationType}>
                                        {item.operationTypeText}
                                    </span>
                                    {item.nameText ? <span>{item.nameText}</span> : <span />}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            return <span className={classNames(styles.middlewareOperationType)}>-</span>;
        }
    }

    private renderValue(modifiedItems: IMiddlewareModifiedItem[]) {
        if (modifiedItems.length) {
            return (
                <div className={styles.middlewareList}>
                    {modifiedItems.map((item, index) => {
                        return (
                            <div
                                key={index}
                                className={classNames(styles.middlewareOperation, {
                                    [commonStyles.paramOverwritten]: item.wasOverwritten
                                })}>
                                <span className={commonStyles.trimText}>{item.value}</span>
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            return <span className={styles.middlewareOperationType}>-</span>;
        }
    }
}

function mapStateToProps(state: IStoreState) {
    return {
        middleware: getMiddleware(state)
    };
}

export default connect(mapStateToProps)(MiddlewareView);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/request/views/RequestMiddleware.tsx