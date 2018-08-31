import Reselect, { createSelector } from 'reselect';
import parseUrl from 'url-parse';
import queryString from 'querystring-browser';

import { IStoreState } from '@client/IStoreState';
import { IMessage } from '@modules/messages/schemas/IMessage';

export interface IRequestResponseQuery {
    url: string;
}

export interface IRequestResponseQueryResult {
    queryParams?: { [key: string]: string | string[] };
}

export function createGetQuerySelector(
    getRequestResponseMessgage: Reselect.Selector<IStoreState, IMessage<IRequestResponseQuery>>
) {
    return createSelector(getRequestResponseMessgage, message => {
        if (message) {
            const request = message.payload;

            let queryParams: { [key: string]: string | string[] } = {};

            if (request && request.url) {
                const parsedUrl = parseUrl(request.url);
                const parsedUrlQuery = parsedUrl.query as string;

                if (parsedUrlQuery && parsedUrlQuery.length > 0) {
                    // Ignore any preceeding '?' in the query string.
                    const normalizedUrlQuery = parsedUrlQuery[0] === '?'
                        ? parsedUrlQuery.slice(1)
                        : parsedUrlQuery;

                    queryParams = queryString.parse(normalizedUrlQuery);
                }
            }

            return {
                queryParams
            };
        }

        return {};
    });
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/query/QuerySelectors.ts