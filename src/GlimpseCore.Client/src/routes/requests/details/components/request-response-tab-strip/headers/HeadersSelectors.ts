import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import Reselect, { createSelector } from 'reselect';

import { IStoreState } from '@client/IStoreState';
import { IMessage } from '@modules/messages/schemas/IMessage';
import { convertStringToAgentType } from '@routes/requests/details/timeline/TimelineUtils';
import { AgentType } from '@routes/requests/details/timeline/TimelineInterfaces';
import { isArray } from '@common/util/CommonUtilities';
import { getKeyCaseInsensitive } from '@common/util/ObjectUtilities';
import {
    IRequestCookie,
    IResponseCookie,
    parseResponseCookies,
    parseRequestCookies,
    filterCookies,
    toCookieString,
    toSetCookieStrings
} from '../cookies/CookieUtils';

export const filteredHeaderNames = ['x-glimpse-contextid'];

export interface IRequestHeaders {
    headers: {
        [key: string]: string;
    };
}

export interface IRequestHeadersResult {
    headers?: {
        [key: string]: string[];
    };
    cookies?: IRequestCookie[];
    isSecurityRestricted?: boolean;
}

export interface IResponseHeaders {
    headers: {
        [key: string]: string[] | string;
    };
    url: string;
    isSecurityRestricted?: boolean;
}

export interface IResponseHeadersResult {
    headers?: {
        [key: string]: string[];
    };
    cookies?: IResponseCookie[];
    isSecurityRestricted?: boolean;
}

export interface IResponseCookiesResult {
    headers?: {
        [key: string]: string[];
    };
    cookies?: IResponseCookie[];
    isSecurityRestricted?: boolean;
    url: string;
}

export function projectHeadersToArray(headers: {
    [key: string]: string | string[];
}): { [key: string]: string[] } {
    let projectedHeaders = mapValues(headers, value => (isArray(value) ? value : [value])) as {
        [key: string]: string[];
    };
    return projectedHeaders;
}

export function isGlimpseHeaderName(headerName: string): boolean {
    return filteredHeaderNames.indexOf(headerName.toLowerCase()) !== -1;
}

export function filterGlimpseSpecificHeaders<
    T extends { [key: string]: string } | { [key: string]: string[] }
>(headers: T): T {
    return pickBy(headers, (value, key) => !isGlimpseHeaderName(key)) as T;
}

const emptyHeaders = {
    headers: {},
    cookies: [],
    isSecurityRestricted: false
};

export function createGetRequestHeadersSelector(
    getRequestMessage: Reselect.Selector<IStoreState, IMessage<IRequestHeaders>>
): Reselect.Selector<IStoreState, IRequestHeadersResult> {
    return createSelector(getRequestMessage, request => {
        return request
            ? {
                  isSecurityRestricted:
                      convertStringToAgentType(request.agent.source) === AgentType.Browser,
                  headers: projectHeadersToArray(request.payload.headers),
                  cookies: parseRequestCookies(request.payload.headers)
              }
            : emptyHeaders;
    });
}

export function createGetFilteredRequestHeadersSelector(
    getRequestHeadersSelector: Reselect.Selector<IStoreState, IRequestHeadersResult>
): Reselect.Selector<IStoreState, IRequestHeadersResult> {
    return createSelector(getRequestHeadersSelector, headerProps => {
        const filteredHeaders = filterGlimpseSpecificHeaders(headerProps.headers);
        const filteredCookies = filterCookies(headerProps.cookies);

        // update the cookie header with stripped-out cookies removed
        const cookieKey = getKeyCaseInsensitive(filteredHeaders, 'cookie');
        if (cookieKey && filteredHeaders[cookieKey]) {
            // request headers should never be an array of length > 1
            filteredHeaders[cookieKey][0] = toCookieString(
                filteredHeaders[cookieKey][0],
                filteredCookies
            );
        }

        return {
            headers: filteredHeaders,
            cookies: filteredCookies,
            isSecurityRestricted: headerProps.isSecurityRestricted
        };
    });
}

export function createGetResponseHeadersSelector(
    getResponseMessage: Reselect.Selector<IStoreState, IMessage<IResponseHeaders>>
): Reselect.Selector<IStoreState, IResponseHeadersResult> {
    return createSelector(getResponseMessage, response => {
        return response
            ? {
                  isSecurityRestricted:
                      convertStringToAgentType(response.agent.source) === AgentType.Browser,
                  headers: projectHeadersToArray(response.payload.headers),
                  cookies: parseResponseCookies(response.payload.headers)
              }
            : emptyHeaders;
    });
}

export function createGetFilteredResponseHeadersSelector(
    getResponseHeadersSelector: Reselect.Selector<IStoreState, IResponseHeadersResult>
): Reselect.Selector<IStoreState, IResponseHeadersResult> {
    return createSelector(getResponseHeadersSelector, headerProps => {
        const filteredHeaders = filterGlimpseSpecificHeaders(headerProps.headers);
        const filteredCookies = filterCookies(headerProps.cookies);

        const setCookieKey = getKeyCaseInsensitive(filteredHeaders, 'set-cookie');
        if (setCookieKey) {
            filteredHeaders[setCookieKey] = toSetCookieStrings(filteredCookies);
        }

        return {
            headers: filteredHeaders,
            cookies: filteredCookies,
            isSecurityRestricted: headerProps.isSecurityRestricted
        };
    });
}

export function createGetFilteredResponseCookiesSelector(
    getResponseMessage: Reselect.Selector<IStoreState, IMessage<IResponseHeaders>>,
    getFilteredResponseHeadersSelector: Reselect.Selector<IStoreState, IResponseHeadersResult>
): Reselect.Selector<IStoreState, IResponseHeadersResult> {
    return createSelector(
        getResponseMessage,
        getFilteredResponseHeadersSelector,
        (response, headerProps) => {
            return {
                url: response ? response.payload.url : '',
                headers: headerProps.headers,
                cookies: headerProps.cookies,
                isSecurityRestricted: headerProps.isSecurityRestricted
            };
        }
    );
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/headers/HeadersSelectors.ts