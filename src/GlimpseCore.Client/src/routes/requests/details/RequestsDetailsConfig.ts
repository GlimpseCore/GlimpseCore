import RequestsDetailsView from './views/RequestsDetails';

import { processRoutes } from '@common/config/config-processor';
import { tabSelected, requestSelected } from './RequestsDetailsActions';
import { getFilteredRequests } from '../RequestsFilterSelectors';

let previousSelectedTab = '';
let previousSelectedRequestId = '';

import { tabData, childConfigs } from './RequestsDetailsTabData';

export default {
    getTabData() {
        return tabData;
    },
    getRoute(store) {
        const templateRoute = {
            onEnter() {
                const tab = this.path;
                if (previousSelectedTab !== tab) {
                    // set which tab has been selected
                    store.dispatch(tabSelected(tab, previousSelectedTab));

                    previousSelectedTab = tab;
                }
            }
        };
        const childRoutes = processRoutes(childConfigs, templateRoute, store);

        return {
            path: ':requestId',
            component: RequestsDetailsView,
            childRoutes: childRoutes,
            onEnter(nextState) {
                const requestId = nextState.params.requestId;
                if (previousSelectedRequestId !== requestId) {
                    const filteredRequests = getFilteredRequests(store.getState());

                    // get data for the selected request
                    const request = filteredRequests.byId[requestId];
                    const webRequest = (request && request.webRequest) || undefined;
                    const webResponse = (request && request.webResponse) || undefined;

                    const previousRequests = filteredRequests.byId[previousSelectedRequestId];
                    const previousRequestValid = !!previousRequests;

                    store.dispatch(
                        requestSelected(
                            requestId,
                            previousSelectedRequestId,
                            webRequest,
                            webResponse,
                            previousRequestValid
                        )
                    );

                    previousSelectedRequestId = requestId;
                }
            },
            indexRoute: {
                onEnter: (nextState, replace) => {
                    // get previously selected tab and redirect to that tab
                    const detailAxis = store.getState().persisted.global.requests.details.route.tab;
                    replace(`/requests/${nextState.params.requestId}/${detailAxis}`);
                }
            }
        };
    }
};



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/RequestsDetailsConfig.ts