import { connect } from 'react-redux';

import {
    getFilteredRequestHeadersSelector,
    getFilteredResponseHeadersSelector,
    getRequestBodySelector,
    getResponseBodySelector,
    getRequestQuerySelector,
    getFilteredResponseCookiesSelector
} from './RequestSelectors';
import {
    buildRequestRouteData,
    buildResponseRouteData,
    createRouteConfig
} from '../components/request-response-tab-strip/RequestResponseTabStripConfig';

import { QueryView } from '../components/request-response-tab-strip/query/QueryView';
import {
    RequestCookiesView,
    ResponseCookiesView
} from '../components/request-response-tab-strip/cookies/CookiesView';
import { BodyView } from '../components/request-response-tab-strip/body/BodyView';
import { HeadersView } from '../components/request-response-tab-strip/headers/HeadersView';

const requestHeadersView = connect(getFilteredRequestHeadersSelector)(HeadersView as any);
const responseHeadersView = connect(getFilteredResponseHeadersSelector)(HeadersView as any);

const requestBodyView = connect(getRequestBodySelector)(BodyView);
const responseBodyView = connect(getResponseBodySelector)(BodyView);

const requestCookiesView = connect(getFilteredRequestHeadersSelector)(RequestCookiesView as any);
const responseCookiesView = connect(getFilteredResponseCookiesSelector)(ResponseCookiesView as any);

const requestQueryView = connect(getRequestQuerySelector)(QueryView);

export const requestConfig = createRouteConfig([
    buildRequestRouteData('Headers', 'headers', requestHeadersView),
    buildRequestRouteData('Body', 'body', requestBodyView),
    buildRequestRouteData('Cookies', 'cookies', requestCookiesView),
    buildRequestRouteData('Query', 'query', requestQueryView)
]);

export const responseConfig = createRouteConfig([
    buildResponseRouteData('Headers', 'headers', responseHeadersView),
    buildResponseRouteData('Body', 'body', responseBodyView),
    buildResponseRouteData('Cookies', 'cookies', responseCookiesView)
]);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/request/RequestTabStripConfig.ts