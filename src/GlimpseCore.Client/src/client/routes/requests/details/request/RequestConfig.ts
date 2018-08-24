import RequestView from './views/Request';

import { normalizePath } from '../components/request-response-tab-strip/RequestResponseTabStripConfig';
import { tabSelected } from '../components/request-response-tab-strip/RequestResponseTabStripActions';

const path = 'request';

function getNormalizedPath(params) {
    const { requestId } = params;

    return `/requests/${requestId}/${path}`;
}

export default {
    getTabData() {
        return {
            title: 'Request',
            getUrl: data => `/requests/${data.requestId}/${path}`
        };
    },
    getRoute(store) {
        return {
            path: path,
            component: RequestView,
            onChange: (prevState, nextState, replace) => {
                const {
                    currentRequestAxis,
                    currentResponseAxis,
                    nextRequestAxis,
                    nextResponseAxis
                } = normalizePath(store, path, nextState, replace, getNormalizedPath);

                if (
                    nextRequestAxis !== currentRequestAxis ||
                    nextResponseAxis !== currentResponseAxis
                ) {
                    store.dispatch(tabSelected(path, nextRequestAxis, nextResponseAxis));
                }
            },
            indexRoute: {
                onEnter: (nextState, replace) => {
                    normalizePath(store, path, nextState, replace, getNormalizedPath);
                }
            }
        };
    }
};



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/request/RequestConfig.ts