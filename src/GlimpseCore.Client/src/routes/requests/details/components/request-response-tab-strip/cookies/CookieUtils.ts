import { isArray } from '@common/util/CommonUtilities';
import { getValueAtKeyCaseInsensitive } from '@common/util/ObjectUtilities';

// consts are lower-cased attribute names that can appear in the Set-Cookie header value
const attrExpires = 'expires';
const attrMaxAge = 'max-age';
const attrDomain = 'domain';
const attrPath = 'path';
const attrHttpOnly = 'httponly';
const attrSecure = 'secure';
const attrSameSite = 'samesite';

/**
 * Request cookies are name/value pairs sent as part of the 'Cookies' header on the request.
 */
export interface IRequestCookie {
    name: string;
    value: string;
    size: number;
    startPosition: number;
    endPosition: number;
}

/**
 * Response cookies 'Set-Cookie' headers on the http response.  They have more info than
 * cookie values sent with the requests 'Cookies' header.
 */
export interface IResponseCookie {
    name: string;
    value: string;
    size: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite?: string;
    domain?: string;
    path?: string;
    maxAgeOrExpires?: string;
    raw: string;
}

export const filteredCookieNames = ['.Glimpse.RequestId', '.Glimpse.Session'];

export function isGlimpseCookieName(cookieName: string): boolean {
    return filteredCookieNames.indexOf(cookieName) !== -1;
}

export function filterCookies<T extends IRequestCookie | IResponseCookie>(cookies: T[]): T[] {
    return cookies.filter(cookie => !isGlimpseCookieName(cookie.name));
}

/**
 * given original cookie string & a list of parsed cookies we want to keep, reconstruct the cookie string
 * stripping out any parsed cookies that aren't in cookies array.
 */
export function toCookieString(originalCookieString: string, cookies: IRequestCookie[]): string {
    let newCookieString = '';
    for (let i = 0; i < cookies.length; i++) {
        newCookieString =
            newCookieString +
            originalCookieString.substring(cookies[i].startPosition, cookies[i].endPosition + 1);
    }
    return newCookieString;
}

export function toSetCookieStrings(cookies: IResponseCookie[]): string[] {
    const setCookieStrings = [];
    for (let i = 0; i < cookies.length; i++) {
        setCookieStrings.push(cookies[i].raw);
    }
    return setCookieStrings;
}

export function parseRequestCookies(headers: { [key: string]: string }): IRequestCookie[] {
    let cookies: IRequestCookie[] = [];

    const cookieHeader = getValueAtKeyCaseInsensitive(headers, 'cookie');
    if (cookieHeader) {
        let start = 0;
        let end = 0;
        let eqIdx = -1;

        while (end < cookieHeader.length) {
            while (end < cookieHeader.length && cookieHeader[end] !== ';') {
                if (cookieHeader[end] === '=') {
                    eqIdx = end;
                }
                ++end;
            }

            if (start < end) {
                const name = eqIdx > start
                    ? cookieHeader.substring(start, eqIdx).trim()
                    : cookieHeader.substring(start, end).trim();
                const value = eqIdx > start ? cookieHeader.substring(eqIdx + 1, end).trim() : '';
                if (name.length > 0) {
                    const cookie = {
                        name,
                        value,
                        size: name.length + value.length, // chrome dev tools computes cookie size this way
                        startPosition: start,
                        endPosition: end
                    };
                    cookies.push(cookie);
                }
            }

            start = ++end;
        }
    }
    return cookies;
}

export function parseResponseCookie(rawCookie: string): IResponseCookie {
    const parts = rawCookie.split(';');
    // get name & value
    if (parts.length > 0) {
        const nameParts = parts[0].split('=');
        let name, value;
        if (nameParts.length > 0) {
            name = nameParts[0] ? nameParts[0].trim() : '';
            if (name.length > 0) {
                value = nameParts[1] ? nameParts[1] : '';

                // get remaining attributes
                const attributes: { [key: string]: string } = {};
                for (let i = 1; i < parts.length; i++) {
                    const p2 = parts[i].split('=');
                    if (p2.length > 0) {
                        const attrName = p2[0].trim().toLowerCase();
                        attributes[attrName] = p2[1];
                    }
                }

                let maxAgeOrExpires = attributes[attrExpires];
                if (attributes.hasOwnProperty(attrMaxAge)) {
                    maxAgeOrExpires = attributes[attrMaxAge];
                }

                const cookie: IResponseCookie = {
                    name,
                    value,
                    size: name.length + value.length, // chrome dev tools computes cookie size this way
                    raw: rawCookie,
                    httpOnly: attributes.hasOwnProperty(attrHttpOnly),
                    secure: attributes.hasOwnProperty(attrSecure)
                };

                if (attributes.hasOwnProperty(attrDomain)) {
                    cookie.domain = attributes[attrDomain];
                }
                if (attributes.hasOwnProperty(attrPath)) {
                    cookie.path = attributes[attrPath];
                }
                if (maxAgeOrExpires !== undefined) {
                    cookie.maxAgeOrExpires = maxAgeOrExpires;
                }
                if (attributes.hasOwnProperty(attrSameSite)) {
                    cookie.sameSite = attributes[attrSameSite];
                }

                return cookie;
            }
        }
    }
}

export function parseResponseCookies(headers: {
    [key: string]: string | string[];
}): IResponseCookie[] {
    const cookies: IResponseCookie[] = [];

    let rawCookies = getValueAtKeyCaseInsensitive(headers, 'set-cookie');
    if (rawCookies) {
        if (isArray(rawCookies)) {
            for (let i = 0; i < rawCookies.length; i++) {
                const result = parseResponseCookie(rawCookies[i]);
                if (result) {
                    cookies.push(result);
                }
            }
        } else {
            const result = parseResponseCookie(rawCookies as string);
            if (result) {
                cookies.push(result);
            }
        }
    }

    return cookies;
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/cookies/CookieUtils.ts