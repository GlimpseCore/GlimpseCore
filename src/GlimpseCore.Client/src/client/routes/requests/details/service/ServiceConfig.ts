import Service from './views/Service';
import ServiceDetails from './views/ServiceDetails';
import { SERVICE_TAB_NAME } from './ServiceConstants';

import { getSelectedExchangeId } from './ServiceSelectors';
import { selectExchangeAction } from './ServiceActions';
import { tabSelected } from '../components/request-response-tab-strip/RequestResponseTabStripActions';
import { normalizePath } from '../components/request-response-tab-strip/RequestResponseTabStripConfig';

export function getSelectedServiceExchangePath(requestId: string, exchangeId: string) {
    return `/requests/${requestId}/${SERVICE_TAB_NAME}/${exchangeId}`;
}

function getNormalizedPath(params) {
    const { requestId, exchangeId } = params;

    return getSelectedServiceExchangePath(requestId, exchangeId);
}

export default {
    getTabData() {
        return {
            title: 'Web services',
            getUrl: data => `/requests/${data.requestId}/${SERVICE_TAB_NAME}`
        };
    },
    getRoute(store) {
        return {
            path: SERVICE_TAB_NAME,
            component: Service,
            indexRoute: {
                onEnter: (nextState, replace) => {
                    const exchangeId = getSelectedExchangeId(store.getState());

                    if (exchangeId) {
                        replace(
                            getSelectedServiceExchangePath(nextState.params.requestId, exchangeId)
                        );
                    }
                }
            },
            childRoutes: [
                {
                    path: ':exchangeId',
                    onEnter: nextState => {
                        const requestId = nextState.params.requestId;
                        const exchangeId = nextState.params.exchangeId;

                        store.dispatch(selectExchangeAction({ requestId, exchangeId }));
                    },
                    onChange: (prevState, nextState, replace) => {
                        const {
                            currentRequestAxis,
                            currentResponseAxis,
                            nextRequestAxis,
                            nextResponseAxis
                        } = normalizePath(
                            store,
                            SERVICE_TAB_NAME,
                            nextState,
                            replace,
                            getNormalizedPath
                        );

                        if (
                            nextRequestAxis !== currentRequestAxis ||
                            nextResponseAxis !== currentResponseAxis
                        ) {
                            store.dispatch(
                                tabSelected(SERVICE_TAB_NAME, nextRequestAxis, nextResponseAxis)
                            );
                        }
                    },
                    components: ServiceDetails,
                    indexRoute: {
                        onEnter: (nextState, replace) => {
                            normalizePath(
                                store,
                                SERVICE_TAB_NAME,
                                nextState,
                                replace,
                                getNormalizedPath
                            );
                        }
                    }
                }
            ]
        };
    }
};



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/service/ServiceConfig.ts