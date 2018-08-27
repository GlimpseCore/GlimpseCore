import isEmpty from 'lodash/isEmpty';
import React from 'react';
import parseUrl from 'url-parse';
import classNames from 'classnames';

import { IRequestCookie, IResponseCookie } from './CookieUtils';

import styles from '../headers/HeadersView.scss';
import cookieStyles from './CookiesView.scss';
import commonStyles from '@common/components/Common.scss';
import { Icon } from '@common/components/Icon';
import {
    FixedWidthLeftColumnTable,
    IColumnInfo
} from '@common/components/FixedWidthLeftColumnTable';
import { InformationLabel } from '@common/components/InformationLabel';

export interface IRequestCookiesProps {
    cookies: IRequestCookie[];
    isSecurityRestricted: boolean;
}

export interface IResponseCookiesProps {
    cookies: IResponseCookie[];
    isSecurityRestricted: boolean;
    url: string;
}

function iconForBoolean(value: boolean): JSX.Element {
    let shape: IconShapeType = 'CheckMark';
    let colorClassName = cookieStyles.isIconCookieTrue;
    if (!value) {
        shape = 'BigX';
        colorClassName = cookieStyles.isIconCookieFalse;
    }

    return <Icon shape={shape} className={classNames(cookieStyles.icon, colorClassName)} />;
}

function iconMeasureFunc(param): number {
    // NOTE: The icons are 1rem, which is roughly 13px.
    return 13;
}

function valueOrDefault(value: string, defaultValue: string): string {
    return value === undefined ? defaultValue : value;
}

function getDomainFromURL(url: string): string {
    let domain = '';
    if (url) {
        const parsed = parseUrl(url);
        domain = parsed.hostname;
    }
    return domain;
}

function renderNone() {
    return <div className={commonStyles.noData}>No cookies found</div>;
}

function renderSecurityRestricted(isSecurityRestricted: boolean) {
    if (isSecurityRestricted) {
        return (
            <InformationLabel
                text="Cookies not displayed due to browser security restrictions."
                textClassName={cookieStyles.contentMessage}
            />
        );
    }
}

export class RequestCookiesView extends React.Component<IRequestCookiesProps, {}> {
    public render() {
        const { cookies, isSecurityRestricted } = this.props;

        return (
            <div className={styles.headers}>
                {renderSecurityRestricted(isSecurityRestricted)}
                {isEmpty(cookies) ? renderNone() : this.renderRequestCookiesTable(cookies)}
            </div>
        );
    }

    private renderRequestCookiesTable(cookies: IRequestCookie[]) {
        const columnInfos: IColumnInfo[] = [
            {
                header: 'Name',
                maxWidth: 200,
                valueFunc: (c: IRequestCookie) => {
                    return c.name;
                },
                titleFunc: (c: IRequestCookie) => {
                    return c.name;
                }
            },
            {
                header: 'Value',
                valueFunc: (c: IRequestCookie) => {
                    return c.value;
                }
            },
            {
                header: 'Size',
                valueFunc: (c: IRequestCookie) => {
                    return '' + c.size;
                }
            }
        ];

        return (
            <FixedWidthLeftColumnTable
                className={styles.headersTable}
                columns={columnInfos}
                params={cookies}
            />
        );
    }
}

export class ResponseCookiesView extends React.Component<IResponseCookiesProps, {}> {
    public render() {
        const { cookies, url, isSecurityRestricted } = this.props;

        return (
            <div className={styles.headers}>
                {renderSecurityRestricted(isSecurityRestricted)}
                {isEmpty(cookies) ? renderNone() : this.renderResponseCookiesTable(url, cookies)}
            </div>
        );
    }

    private renderResponseCookiesTable(url: string, cookies: IResponseCookie[]) {
        const defaultDomain = getDomainFromURL(url);

        const columnInfos: IColumnInfo[] = [
            {
                header: 'Name',
                valueFunc: (c: IResponseCookie) => {
                    return c.name;
                },
                titleFunc: (c: IResponseCookie) => {
                    return c.name;
                }
            },
            {
                header: 'Value',
                valueFunc: (c: IResponseCookie) => {
                    return c.value;
                }
            },
            {
                header: 'Size',
                valueFunc: (c: IResponseCookie) => {
                    return '' + c.size;
                }
            },
            {
                header: 'Domain',
                valueFunc: (c: IResponseCookie) => {
                    return valueOrDefault(c.domain, defaultDomain);
                }
            },
            {
                header: 'Path',
                valueFunc: (c: IResponseCookie) => {
                    return valueOrDefault(c.path, '/');
                }
            },
            {
                header: 'Max-Age/Expires',
                valueFunc: (c: IResponseCookie) => {
                    return valueOrDefault(c.maxAgeOrExpires, 'Session');
                }
            },
            {
                header: 'HttpOnly',
                valueFunc: (c: IResponseCookie) => {
                    return iconForBoolean(c.httpOnly);
                },
                measureFunc: iconMeasureFunc
            },
            {
                header: 'Secure',
                valueFunc: (c: IResponseCookie) => {
                    return iconForBoolean(c.secure);
                },
                measureFunc: iconMeasureFunc
            },
            {
                header: 'SameSite',
                valueFunc: (c: IResponseCookie) => {
                    return valueOrDefault(c.sameSite, '-');
                }
            }
        ];

        return (
            <FixedWidthLeftColumnTable
                className={styles.headersTable}
                columns={columnInfos}
                params={cookies}
            />
        );
    }
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/cookies/CookiesView.tsx