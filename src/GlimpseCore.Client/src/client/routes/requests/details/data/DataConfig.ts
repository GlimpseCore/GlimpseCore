import { selectExchangeAction } from './DataActions';
import Data from './Data';
import DataDetails from './DataDetails';
import { tabSelected } from '../components/request-response-tab-strip/RequestResponseTabStripActions';
import { getSelectedContextId } from 'routes/requests/RequestsSelector';

import { normalizePath } from '../components/request-response-tab-strip/RequestResponseTabStripConfig';
import { getSelectedExchangeId } from 'routes/requests/details/data/DataSelectors';
import { ISelectedTabState } from 'routes/requests/details/data/DataInterfaces';

export const DATA_TAB_NAME = 'data';

export function getSelectedDataExchangePath(requestId: string, exchangeId: string) {
    return `/requests/${requestId}/${DATA_TAB_NAME}/${exchangeId}`;
}

function getNormalizedPath(params) {
    const { requestId, exchangeId } = params;

    return getSelectedDataExchangePath(requestId, exchangeId);
}

const tabsDefaultState: ISelectedTabState = {
    requestTab: 'query',
    responseTab: 'summary'
};

export default {
    getTabData() {
        return {
            title: 'Data access',
            getUrl: data => `/requests/${data.requestId}/${DATA_TAB_NAME}`
        };
    },
    getRoute(store) {
        return {
            path: DATA_TAB_NAME,
            component: Data,
            indexRoute: {
                onEnter: (nextState, replace) => {
                    const exchangeId = getSelectedExchangeId(store.getState());
                    const requestId = getSelectedContextId(store.getState());

                    if (exchangeId) {
                        replace(getSelectedDataExchangePath(requestId, exchangeId));
                    }
                }
            },
            childRoutes: [
                {
                    path: ':exchangeId',
                    onEnter: nextState => {
                        const { requestId, exchangeId } = nextState.params;

                        store.dispatch(selectExchangeAction({ requestId, exchangeId }));
                    },
                    onChange: (prevState, nextState, replace) => {
                        // we keep naming `reqeust` and `response`
                        // to be consistent with `Service` and `Logging` tabs
                        // issue that tracks it: https://github.com/Glimpse/Glimpse.Client/issues/1348
                        const {
                            currentRequestAxis,
                            currentResponseAxis,
                            nextRequestAxis,
                            nextResponseAxis
                        } = normalizePath(
                            store,
                            DATA_TAB_NAME,
                            nextState,
                            replace,
                            getNormalizedPath,
                            tabsDefaultState
                        );

                        if (
                            nextRequestAxis !== currentRequestAxis ||
                            nextResponseAxis !== currentResponseAxis
                        ) {
                            store.dispatch(
                                tabSelected(DATA_TAB_NAME, nextRequestAxis, nextResponseAxis)
                            );
                        }
                    },
                    components: DataDetails,
                    indexRoute: {
                        onEnter: (nextState, replace) => {
                            normalizePath(
                                store,
                                DATA_TAB_NAME,
                                nextState,
                                replace,
                                getNormalizedPath,
                                tabsDefaultState
                            );
                        }
                    }
                }
            ]
        };
    }
};



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataConfig.ts