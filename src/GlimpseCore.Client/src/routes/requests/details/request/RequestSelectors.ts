import * as Glimpse from '@_glimpse/glimpse-definitions';
import { createSelector } from 'reselect';

import { getSingleMessageByType } from '@routes/requests/RequestsSelector';
import { getSelectedContext } from '../RequestsDetailsSelector';
import {
    createGetRequestHeadersSelector,
    createGetResponseHeadersSelector,
    createGetFilteredRequestHeadersSelector,
    createGetFilteredResponseHeadersSelector,
    createGetFilteredResponseCookiesSelector
} from '@routes/requests/details/components/request-response-tab-strip/headers/HeadersSelectors';
import { createGetBodySelector } from '@routes/requests/details/components/request-response-tab-strip/body/BodySelectors';
import { createGetQuerySelector } from '@routes/requests/details/components/request-response-tab-strip/query/QuerySelectors';

import { IContext } from '@routes/requests/RequestsInterfaces';

function createSingleMessageSelector<T>(type: string) {
    return createSelector(getSelectedContext, selectedContext => {
        if (selectedContext) {
            return getSingleMessageByType<T>(selectedContext.byType, type);
        }

        return undefined;
    });
}

// TODO: should be refactored into `../request-selectors.ts'
// TODO: this should not be a selector, should use same method as getBrowserNavigationTiming.
//       IContextByType provides index look up and does't need selector caching.
export const getWebRequest = createSingleMessageSelector<Glimpse.Messages.Payloads.Web.IRequest>(
    Glimpse.Messages.Payloads.Web.RequestType
);

// TODO: should be refactored into `../request-selectors.ts'
// TODO: this should not be a selector, should use same method as getBrowserNavigationTiming.
//       IContextByType provides index look up and does't need selector caching.
export const getWebResponse = createSingleMessageSelector<Glimpse.Messages.Payloads.Web.IResponse>(
    Glimpse.Messages.Payloads.Web.ResponseType
);

/**
 * Finds `INavigationTiming` in the provided context.
 */
export function getBrowserNavigationTiming(context: IContext) {
    return getSingleMessageByType<Glimpse.Messages.Payloads.Browser.INavigationTiming>(
        context.byType,
        Glimpse.Messages.Payloads.Browser.NavigationTimingType
    );
}

export const getRequestHeadersSelector = createGetRequestHeadersSelector(getWebRequest);

export const getResponseHeadersSelector = createGetResponseHeadersSelector(getWebResponse);

export const getFilteredRequestHeadersSelector = createGetFilteredRequestHeadersSelector(
    getRequestHeadersSelector
);

export const getFilteredResponseHeadersSelector = createGetFilteredResponseHeadersSelector(
    getResponseHeadersSelector
);

export const getFilteredResponseCookiesSelector = createGetFilteredResponseCookiesSelector(
    getWebResponse,
    getFilteredResponseHeadersSelector
);

export const getRequestBodySelector = createGetBodySelector(getWebRequest);

export const getResponseBodySelector = createGetBodySelector(getWebResponse);

export const getRequestQuerySelector = createGetQuerySelector(getWebRequest);

// TODO: should be refactored into `../request-selectors.ts'
/**
 * Returns the offset factor needed to be added to server messages in order to
 * correctly place server events in a timeline with client messages. This value
 * should be added to the offset of the message.
 */
export const getServerOffsetFactor = createSelector(getSelectedContext, (context): number => {
    if (context) {
        const browserNavigationTiming = getBrowserNavigationTiming(context);
        if (
            browserNavigationTiming &&
            browserNavigationTiming.payload.requestStart &&
            browserNavigationTiming.payload.navigationStart
        ) {
            const factor =
                browserNavigationTiming.payload.requestStart -
                browserNavigationTiming.payload.navigationStart;
            return factor < 0 ? 0 : factor;
        }
    }
    return 0;
});



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/request/RequestSelectors.ts