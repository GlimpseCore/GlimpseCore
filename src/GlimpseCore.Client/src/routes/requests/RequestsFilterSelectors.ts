import { createSelector } from 'reselect';

import { IStoreState } from '@client/IStoreState';
import { IRequestsLookup, IRequest } from './RequestsInterfaces';
import { IRequestsFilterState, IRequestFilterDetails } from './RequestsFilterInterfaces';
import { getRequestsLookup } from './RequestsSelector';
import { isDataType } from '@common/util/ContentTypes';
import { initialState as initialFilterState } from '@routes/requests/RequestsFilterReducer';
import { timeStart, timeEnd } from '@common/util/Log';

export const getFilters: (state: IStoreState) => IRequestsFilterState = state =>
    state.persisted.global.requests.filter;

export const isFilterReset = (filterState: IRequestsFilterState): boolean => {
    return (
        Object.keys(filterState.method).length === 0 &&
        Object.keys(filterState.status).length === 0 &&
        filterState.contentTypeClass === initialFilterState.contentTypeClass
    );
};

const OTHER_METHOD_NAME = 'Other';

export const methodNames = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', OTHER_METHOD_NAME];

export const getFilteredRequests: (state: IStoreState) => IRequestFilterDetails = (function() {
    function statusCodeGroup(status: number) {
        return (Math.round(status / 100) * 100).toString();
    }

    function incrementContentTypeClassCount(target: { [key: string]: number }, value: number) {
        // if only has one content type class, then we can increment the
        // counter directly, otherwise we need to update the various parts
        // tslint:disable-next-line:no-bitwise
        if ((value & (value - 1)) === 0) {
            incrementCount(target, value);
        } else {
            for (let i = 0; i < 32; i++) {
                // tslint:disable:no-bitwise
                const mask = 1 << i;
                if ((mask & value) !== 0) {
                    incrementCount(target, mask);
                }
                // tslint:enable:no-bitwise
            }
        }
    }

    function incrementCount(target: { [key: string]: number }, key: string | number) {
        target[key] = (target[key] || 0) + 1;
    }

    return createSelector(
        getRequestsLookup,
        getFilters,
        (requestLookups: IRequestsLookup, filters: IRequestsFilterState) => {
            timeStart('[PERF] RequestsFilterdSelectors.getFilteredRequests');

            const listing: IRequest[] = [];
            const byId: { [key: string]: IRequest } = {};
            let totalCount = 0;
            let filteredCount = 0;

            const indexedTotalCount = {
                method: {},
                status: {},
                contentTypeClass: {}
            };
            const indexedFilteredCount = {
                method: {},
                status: {},
                contentTypeClass: {}
            };

            requestLookups.listing.forEach(request => {
                // this filter is only temporary until more advanced filters are implmented
                if (
                    request.webResponse.url.indexOf('/sockjs-node/info') === -1 &&
                    request.webRequest.url.indexOf('/glimpse/') === -1 &&
                    !(
                        request.webResponse.url.substr(-'.map'.length) === '.map' &&
                        isDataType(request.mediaType.contentTypeClass)
                    )
                ) {
                    // since the above filters are in play this counter need to track
                    // the total number of requests
                    totalCount++;

                    const requestMethod = request.webRequest.method.toUpperCase();
                    const method = methodNames.indexOf(requestMethod) > -1
                        ? requestMethod
                        : OTHER_METHOD_NAME;
                    const status = statusCodeGroup(request.webResponse.statusCode);
                    const contentTypeClass = request.mediaType.contentTypeClass;

                    incrementCount(indexedTotalCount.method, method);
                    incrementCount(indexedTotalCount.status, status);
                    incrementContentTypeClassCount(
                        indexedTotalCount.contentTypeClass,
                        contentTypeClass
                    );

                    // user driven filters
                    if (
                        !filters.method[method] &&
                        !filters.status[status] &&
                        // tslint:disable-next-line:no-bitwise
                        !((contentTypeClass & filters.contentTypeClass) === 0)
                    ) {
                        filteredCount++;

                        listing.push(request);
                        byId[request.id] = request;

                        incrementCount(indexedFilteredCount.method, method);
                        incrementCount(indexedFilteredCount.status, status);
                        incrementContentTypeClassCount(
                            indexedFilteredCount.contentTypeClass,
                            contentTypeClass
                        );
                    }
                }
            });

            timeEnd('[PERF] RequestsFilterdSelectors.getFilteredRequests');

            return {
                totalCount,
                filteredCount,
                indexedTotalCount,
                indexedFilteredCount,
                listing,
                byId
            };
        }
    );
})();



// WEBPACK FOOTER //
// ./src/client/routes/requests/RequestsFilterSelectors.ts