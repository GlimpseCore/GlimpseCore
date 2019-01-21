import * as Glimpse from '@_glimpse/glimpse-definitions';
import { createSelector } from 'reselect';

import {
    IExchangeModel,
    IExchangeModels,
    IFilterValue,
    StatusCodeClass,
    IServiceStatusCodeClassCount,
    IServiceStatusCodeClassSummary
} from './ServiceInterfaces';
import { convertStatusCodeToStatusCodeClass } from './ServiceUtils';
import {
    getSelectedRequestPersistedState,
    getMessageByType
} from '@routes/requests/RequestsSelector';
import { getSelectedContext } from '../RequestsDetailsSelector';
import { getServerOffsetFactor } from '../request/RequestSelectors';
import {
    createGetRequestHeadersSelector,
    createGetResponseHeadersSelector,
    createGetFilteredRequestHeadersSelector,
    createGetFilteredResponseHeadersSelector,
    createGetFilteredResponseCookiesSelector
} from '../components/request-response-tab-strip/headers/HeadersSelectors';
import { createGetBodySelector } from '../components/request-response-tab-strip/body/BodySelectors';
import { createGetQuerySelector } from '../components/request-response-tab-strip/query/QuerySelectors';
import { IStoreState } from '@client/IStoreState';
import { getIntegersForEnum } from '@common/util/CommonUtilities';
import { getValueAtKeyCaseInsensitive } from '@common/util/ObjectUtilities';

// TODO - https://github.com/Glimpse/Glimpse.Client/issues/656, https://github.com/Glimpse/Glimpse.Client/issues/657
// refactor into common location
import { convertStringToAgentType } from '../timeline/TimelineUtils';
import {
    ITimelineAgentCount,
    ITimelineAgentSummary,
    AgentType
} from '../timeline/TimelineInterfaces';
// --

/**
 * returns the current filters state for the by-agent filters
 */
const getAgentFiltersState = (state: IStoreState): IFilterValue =>
    state.persisted.global.requests.details.service.filters.agent;

/**
 * returns the current filters state for the by-status-code filters
 */
const getStatusCodeFiltersState = (state: IStoreState): IFilterValue =>
    state.persisted.global.requests.details.service.filters.statusCode;

/**
 * returns the currently selected exchange ID for the currently selected request
 */
export const getSelectedExchangeId = createSelector(
    getSelectedRequestPersistedState,
    selectedRequestPersistedState => {
        return selectedRequestPersistedState
            ? selectedRequestPersistedState.details.service.selectedExchangeId
            : undefined;
    }
);

/**
 * returns IExchangeModel[] for curret request before any filters have been applied
 */
export const getWebServiceExchanges: (state: IStoreState) => IExchangeModel[] = (function() {
    const getRawHttpData = createSelector(getSelectedContext, selectedContext => {
        const rawRequests = selectedContext
            ? getMessageByType<
                  Glimpse.Messages.Payloads.Data.Http.IRequest &
                      Glimpse.Messages.Payloads.Mixin.ICallStack
              >(selectedContext.byType, "Glimpse.Messages.Payloads.Data.Http.RequestType")
            : [];
        const rawResponses = selectedContext
            ? getMessageByType<Glimpse.Messages.Payloads.Data.Http.IResponse>(
                  selectedContext.byType,
                  "Glimpse.Messages.Payloads.Data.Http.ResponseType"
              )
            : [];
        return { rawRequests, rawResponses };
    });

    return createSelector(
        getRawHttpData,
        getServerOffsetFactor,
        (httpData, offsetFactor): IExchangeModel[] => {
            const exchangesByCorrelationId: {
                [key: string]: IExchangeModel;
            } = {};
            const exchanges: IExchangeModel[] = [];

            if (httpData.rawRequests) {
                httpData.rawRequests.forEach(request => {
                    const current: IExchangeModel = {
                        request,
                        eventId: request.payload.correlationId,
                        ordinal: request.ordinal,
                        index: undefined, // Will be filled in after-the-fact.
                        agent: convertStringToAgentType(request.agent.source),
                        statusCodeClass: StatusCodeClass.None,
                        offset:
                            (request.agent.source === 'server' ? offsetFactor : 0) + request.offset,
                        duration: undefined // Will be filled in after-the-fact.
                    };

                    exchanges.push(current);
                    exchangesByCorrelationId[current.eventId] = current;
                });
            }

            if (httpData.rawResponses) {
                httpData.rawResponses.forEach(response => {
                    const current: IExchangeModel =
                        exchangesByCorrelationId[response.payload.correlationId];

                    if (current) {
                        current.response = response;
                        current.statusCodeClass = convertStatusCodeToStatusCodeClass(
                            response.payload.statusCode
                        );
                        current.duration = response.payload.duration;

                        const contextId = getValueAtKeyCaseInsensitive<string | string[]>(
                            response.payload.headers,
                            'X-Glimpse-ContextID'
                        );

                        if (contextId) {
                            current.linkedContextId = contextId.toString();
                        }
                    } else {
                        const newExchange: IExchangeModel = {
                            response,
                            eventId: response.payload.correlationId,
                            ordinal: response.ordinal,
                            index: undefined, // Will be filled in after-the-fact.
                            agent: convertStringToAgentType(response.agent.source),
                            statusCodeClass: convertStatusCodeToStatusCodeClass(
                                response.payload.statusCode
                            ),
                            offset:
                                (response.agent.source === 'server' ? offsetFactor : 0) +
                                    response.offset,
                            // NOTE: Any duration specified would be relative to the request's offset, not the response's.
                            duration: 0
                        };

                        exchanges.push(newExchange);
                    }
                });
            }

            exchanges.sort((a, b) => a.offset - b.offset);

            // Assign indices after sorting and before filtering...
            exchanges.forEach((exchange, index) => {
                exchange.index = index + 1;
            });

            return exchanges;
        }
    );
})();

/**
 * returns IExchangeModel[] after agent filters have been applied
 */
export const getAgentFilteredtWebServiceExchanges: (
    state: IStoreState
) => IExchangeModel[] = createSelector(
    getWebServiceExchanges,
    getAgentFiltersState,
    (exchanges, agentFilteredState: IFilterValue) => {
        return exchanges.filter((e: IExchangeModel) => {
            return agentFilteredState[e.agent];
        });
    }
);

/**
 * returns IExchangeModels after agent & status-code filters have been applied
 */
export const getStatusCodeFilteredWebServiceExchanges: (
    state: IStoreState
) => IExchangeModels = createSelector(
    getAgentFilteredtWebServiceExchanges,
    getStatusCodeFiltersState,
    (exchanges, statusCodeFiltersState: IFilterValue) => {
        const filteredExchanges = exchanges.filter((e: IExchangeModel) => {
            return statusCodeFiltersState[e.statusCodeClass];
        });

        const exchangesByCorrelationId: { [key: string]: IExchangeModel } = {};
        filteredExchanges.forEach(v => {
            exchangesByCorrelationId[v.eventId] = v;
        });

        return {
            exchanges: filteredExchanges,
            exchangesByCorrelationId: exchangesByCorrelationId
        };
    }
);

/**
 * Returns the specific IExchangeModel that is selected in the UI, or undefined if none is selected
 */
export const getSelectedExchange: (
    state: IStoreState
) => IExchangeModel = createSelector(
    getStatusCodeFilteredWebServiceExchanges,
    getSelectedExchangeId,
    (requestData, selectedExchangeId) => {
        return requestData.exchangesByCorrelationId[selectedExchangeId];
    }
);

/**
 * Returns the associated http-data-request message for exchange selected in the UI, or undefined if none is selected
 */
export const getSelectedExchangeRequest = createSelector(getSelectedExchange, selectedExchange => {
    return (selectedExchange && selectedExchange.request) || undefined;
});

/**
 * Returns the associated http-data-response message for exchange selected in the UI, or undefined if none is selected
 */
export const getSelectedExchangeResponse = createSelector(getSelectedExchange, selectedExchange => {
    return (selectedExchange && selectedExchange.response) || undefined;
});

/**
 * Selector to get unfiltered request headers for the currently selected exchange
 */
export const getRequestHeadersSelector = createGetRequestHeadersSelector(
    getSelectedExchangeRequest as any
);

/**
 * Selector to get unfiltered response headers for currently selected exchange
 */
export const getResponseHeadersSelector = createGetResponseHeadersSelector(
    getSelectedExchangeResponse as any
);

/**
 * Selector to get filtered request headers for currently selected exchange
 */
export const getFilteredRequestHeadersSelector = createGetFilteredRequestHeadersSelector(
    getRequestHeadersSelector
);

/**
 * Selector to get filtered response headers for currently selected exchange
 */
export const getFilteredResponseHeadersSelector = createGetFilteredResponseHeadersSelector(
    getResponseHeadersSelector
);

/**
 * Selector to get filtered response cookies for currently selected exchange
 */
export const getFilteredResponseCookiesSelector = createGetFilteredResponseCookiesSelector(
    getSelectedExchangeResponse as any,
    getFilteredResponseHeadersSelector
);

/**
 * Selector to get request body for currently selected exchange
 */
export const getRequestBodySelector = createGetBodySelector(getSelectedExchangeRequest as any);

/**
 * Selector to get repsonse body for currently selected exchange
 */
export const getResponseBodySelector = createGetBodySelector(getSelectedExchangeResponse as any);

/**
 * Selector to get request query for currently selected exchange
 */
export const getRequestQuerySelector = createGetQuerySelector(getSelectedExchangeRequest as any);

//
// COUNT RECORDS SELECTORS
//

/**
 * return counts of unfiltered exchanges grouped by Agent type
 */
export const getUnfilteredByAgentCounts = createSelector(
    getWebServiceExchanges,
    (exchanges: IExchangeModel[]): ITimelineAgentCount[] => {
        const counts: number[] = [];

        const values = getIntegersForEnum(AgentType);
        for (let i = 0; i < values.length; i++) {
            counts[i] = 0;
        }

        for (let i = 0; i < exchanges.length; i++) {
            counts[exchanges[i].agent] = counts[exchanges[i].agent] + 1;
        }

        return values.map(v => {
            return {
                name: AgentType[v],
                count: counts[v],
                agent: v
            } as ITimelineAgentCount;
        });
    }
);

/**
 * Get filter summary info for Agent filters
 */
export const getAgentFilterSummaries = createSelector(
    getUnfilteredByAgentCounts,
    getAgentFiltersState,
    (agentCounts, agentFilters: IFilterValue): ITimelineAgentSummary[] => {
        return agentCounts
            .map(entry => {
                return {
                    name: entry.name,
                    count: entry.count,
                    agent: entry.agent,
                    isShown: agentFilters[entry.agent]
                };
            })
            .filter(e => e.agent !== AgentType.Other);
    }
);

/**
 * Count each given set of exchanges by status code
 */
function countByStatusCodeClass(exchanges: IExchangeModel[]): IServiceStatusCodeClassCount[] {
    const counts: number[] = [];

    const enumVals = getIntegersForEnum(StatusCodeClass);
    for (let i = 0; i < enumVals.length; i++) {
        counts[i] = 0;
    }

    for (let i = 0; i < exchanges.length; i++) {
        counts[exchanges[i].statusCodeClass] = counts[exchanges[i].statusCodeClass] + 1;
    }

    return enumVals.map(v => {
        return {
            name: StatusCodeClass[v],
            count: counts[v],
            statusCode: v
        } as IServiceStatusCodeClassCount;
    });
}

/**
 * return counts of unfiltered exchanges grouped by StatusCodeClass
 */
export const getUnfilteredByStatusCodeClassCounts = createSelector(
    getWebServiceExchanges,
    countByStatusCodeClass
);

export const getStatusCodeFilterSummaries = (() => {
    const getFilteredByStatusCodeCounts = createSelector(
        getAgentFilteredtWebServiceExchanges,
        countByStatusCodeClass
    );

    // the "by-status-code" summary counts always reflect the counts of events filtered by agent
    return createSelector(
        getFilteredByStatusCodeCounts,
        getStatusCodeFiltersState,
        (categoryCounts, categoryFilters: IFilterValue): IServiceStatusCodeClassSummary[] => {
            return categoryCounts
                .filter(
                    e =>
                        e.statusCode !== StatusCodeClass.Other &&
                        e.statusCode !== StatusCodeClass.None
                )
                .map(entry => {
                    return {
                        name: entry.name,
                        count: entry.count,
                        statusCode: entry.statusCode,
                        isShown: categoryFilters[entry.statusCode]
                    };
                });
        }
    );
})();

/**
 * Return the minimum- and maximum-offset for the set of all service requests (i.e. exchanges).
 */
export const getTimelineEventsOffsetBoundary = createSelector(
    getWebServiceExchanges,
    (exchanges: IExchangeModel[]) => {
        const maxOffset = exchanges.reduce(
            (prev, exchange) =>
                exchange.duration ? Math.max(prev, exchange.offset + exchange.duration) : prev,
            0.1
        );

        return {
            minOffset: 0,
            maxOffset
        };
    }
);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/service/ServiceSelectors.ts