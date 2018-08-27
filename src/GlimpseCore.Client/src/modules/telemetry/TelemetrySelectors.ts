import { createSelector } from 'reselect';
import uniq from 'lodash/uniq';
import maxBy from 'lodash/maxBy';
import forEach from 'lodash/forEach';

import { getValueAtKeyCaseInsensitive } from 'common/util/ObjectUtilities';
import {
    getLoggingMessages,
    getUnfilteredByLevelCounts as getLoggingUnfilteredByLevelCounts,
    getUnfilteredByAgentCounts as getLoggingUnfilteredByAgentCounts
} from 'routes/requests/details/logging/LoggingSelectors';
import {
    getRequestHeadersSelector,
    getResponseHeadersSelector
} from 'routes/requests/details/request/RequestSelectors';
import {
    getMiddlewareStartAndEndMessages,
    getMiddleware
} from 'routes/requests/details/request/RequestMiddlewareSelectors';
import {
    getTimelineEvents,
    getUnfilteredByCategoryCounts as getTimelineUnfilteredByCategoryCounts,
    getUnfilteredByAgentCounts as getTimelineUnfilteredByAgentCounts
} from 'routes/requests/details/timeline/TimelineSelectors';
import {
    AgentType,
    TimelineEventCategory
} from 'routes/requests/details/timeline/TimelineInterfaces';
import {
    getWebServiceExchanges,
    getUnfilteredByAgentCounts as getServiceUnfilteredByAgentCounts,
    getUnfilteredByStatusCodeClassCounts as getServiceUnfilteredByStatusCodeClassCounts
} from 'routes/requests/details/service/ServiceSelectors';
import { StatusCodeClass } from 'routes/requests/details/service/ServiceInterfaces';
import { getOperations } from 'routes/requests/details/data/DataSelectors';
import {
    IDataOperation,
    DataDatabaseType,
    DataOperationType
} from 'routes/requests/details/data/DataInterfaces';
import { IMeasurements, IProperties } from './TelemetryInterfaces';
import { getNamesForEnum } from 'common/util/CommonUtilities';

/**
 * request header telemetry properties
 */
export const getRequestHeaderTelemetryProperties = createSelector(
    getRequestHeadersSelector,
    request => {
        const contentType = getValueAtKeyCaseInsensitive(request.headers, 'content-type');
        const contentLength = getValueAtKeyCaseInsensitive(request.headers, 'content-length');
        const obj = {};
        if (contentType) {
            obj['request-content-type'] = contentType.join(',');
        }
        if (contentLength) {
            obj['request-content-length'] = contentLength.join(',');
        }
        return obj;
    }
);

/**
 * response header telemetry measurements
 */
export const getRequestHeaderTelemetryMeasurements = createSelector(
    getRequestHeadersSelector,
    request => {
        let numHeaders = 0;
        forEach(request.headers, () => {
            ++numHeaders;
        });
        const obj: { [key: string]: number } = {};
        obj['request-header-count'] = numHeaders;
        return obj;
    }
);

/**
 * response header telemetry properties
 */
export const getResponseHeaderTelemetryProperties = createSelector(
    getResponseHeadersSelector,
    request => {
        const contentType = getValueAtKeyCaseInsensitive(request.headers, 'content-type');
        const contentLength = getValueAtKeyCaseInsensitive(request.headers, 'content-length');
        const obj = {};
        if (contentType) {
            obj['response-content-type'] = contentType.join(',');
        }
        if (contentLength) {
            obj['response-content-length'] = contentLength.join(',');
        }
        return obj;
    }
);

/**
 * response header telemetry measurements
 */
export const getResponseHeaderTelemetryMeasurements = createSelector(
    getResponseHeadersSelector,
    request => {
        let numHeaders = 0;
        forEach(request.headers, () => {
            ++numHeaders;
        });
        const obj: { [key: string]: number } = {};
        obj['response-header-count'] = numHeaders;
        return obj;
    }
);

/**
 * middleware telemetry properties
 */
export const getMiddlewareTelemetryProperties = createSelector(
    getMiddlewareStartAndEndMessages,
    middlewareMessages => {
        let obj = {};
        if (middlewareMessages) {
            let anonymousMiddleware = [];
            for (let i = 0; i < middlewareMessages.middlewareStartMessages.length; i++) {
                const payload = middlewareMessages.middlewareStartMessages[i].payload;
                if (payload.name === '<anonymous>' || !payload.name || payload.name === undefined) {
                    if (payload.packageName) {
                        anonymousMiddleware.push(payload.packageName);
                    }
                }
            }
            if (anonymousMiddleware.length > 0) {
                obj['anonymous-middleware-packages'] = uniq(anonymousMiddleware).join(',');
            }
        }
        return obj;
    }
);

/**
 * middleware telemetry measurements
 */
export const getMiddlewareTelemetryMeasurements = createSelector(
    getMiddlewareStartAndEndMessages,
    middlewareMessages => {
        const obj: { [key: string]: number } = {};
        if (middlewareMessages) {
            let anonymousCount = 0;
            let i = 0;
            for (; i < middlewareMessages.middlewareStartMessages.length; i++) {
                const payload = middlewareMessages.middlewareStartMessages[i].payload;
                if (payload.name === '<anonymous>' || !payload.name || payload.name === undefined) {
                    ++anonymousCount;
                }
            }
            if (i > 0) {
                obj['middleware-count-total'] = i;
                obj['middleware-count-anonymous'] = anonymousCount;
            }
        }
        return obj;
    }
);

/**
 * middleware maxDepth
 */
export const getMiddlewareTelemetryMaxDepth = createSelector(getMiddleware, flattenedMiddleware => {
    const obj: { [key: string]: number } = {};
    if (flattenedMiddleware && flattenedMiddleware.length) {
        obj['middleware-max-depth'] = maxBy(
            flattenedMiddleware,
            middleware => middleware.depth
        ).depth;
    }
    return obj;
});

/**
 * logging tab measurements
 */
export const getLoggingTabMeasurements = createSelector(
    getLoggingMessages,
    getLoggingUnfilteredByAgentCounts,
    getLoggingUnfilteredByLevelCounts,
    (messages, byAgentCounts, byLevelCounts) => {
        const result = {
            logging_numberOfMessages: messages.length
        };

        byAgentCounts.forEach(v => {
            result[`logging_agentCount_${AgentType[v.agent]}`] = v.count;
        });

        byLevelCounts.forEach(v => {
            result[`logging_categoryCount_${TimelineEventCategory[v.level]}`] = v.count;
        });

        return result;
    }
);

/**
 * timeline tab measurements
 */
export const getTimelineTabMeasurements = createSelector(
    getTimelineEvents,
    getTimelineUnfilteredByAgentCounts,
    getTimelineUnfilteredByCategoryCounts,
    (timelineEvents, byAgentCounts, byCategoryCounts) => {
        const result = {
            timeline_numberOfSpans: timelineEvents.spans.length,
            timeline_numberOfPointInTimeEvents: timelineEvents.pointInTimeEvents.length
        };

        byAgentCounts.forEach(v => {
            result[`timeline_agentCount_${AgentType[v.agent]}`] = v.count;
        });

        byCategoryCounts.forEach(v => {
            result[`timeline_categoryCount_${TimelineEventCategory[v.category]}`] = v.count;
        });

        return result;
    }
);

/**
 * timeline tab measurements
 */
export const getServicesTabMeasurements = createSelector(
    getWebServiceExchanges,
    getServiceUnfilteredByAgentCounts,
    getServiceUnfilteredByStatusCodeClassCounts,
    (webServiceExchanges, byAgentCounts, byStatusCodeCounts) => {
        const result = {
            service_numberOfWebServices: webServiceExchanges.length
        };

        byAgentCounts.forEach(v => {
            result[`service_agentCount_${AgentType[v.agent]}`] = v.count;
        });

        byStatusCodeCounts.forEach(v => {
            result[`timeline_categoryCount_${StatusCodeClass[v.statusCode]}`] = v.count;
        });

        return result;
    }
);

/**
 * data tab measurements
 */
export const getDataTabMeasurements = createSelector(
    getOperations,
    (dataOperations: IDataOperation[]): IMeasurements => {
        const measurements: { [key: string]: number } = {};
        getNamesForEnum(DataDatabaseType).forEach(dbType => {
            getNamesForEnum(DataOperationType).forEach(opType => {
                measurements[`data_${dbType}_${opType}`] = 0;
            });
        });

        dataOperations.forEach(op => {
            measurements[
                `data_${DataDatabaseType[op.databaseType]}_${DataOperationType[op.operationType]}`
            ] += 1;
        });

        return measurements;
    }
);

/**
 * data tab properties
 */
export const getDataTabProperties = createSelector(
    getOperations,
    (dataOperations: IDataOperation[]): IProperties => {
        const t = {};

        getNamesForEnum(DataDatabaseType).forEach(dbType => {
            getNamesForEnum(DataOperationType).forEach(opType => {
                t[`data_${dbType}_${opType}_queryLengths`] = [];
                t[`data_${dbType}_${opType}_optionLengths`] = [];
                t[`data_${dbType}_${opType}_docCount`] = [];
                t[`data_${dbType}_${opType}_docLengths`] = [];
            });
        });

        dataOperations.forEach(op => {
            let queryLength = 0;
            if (op.query) {
                queryLength = op.query === 'string'
                    ? op.query.length
                    : JSON.stringify(op.query).length;
            }

            let optionLength = 0;
            if (op.options) {
                optionLength = JSON.stringify(op.options).length;
            }

            let docCount = 0;
            let docsLength = 0;
            if (op.docs) {
                docCount = op.docs.length;
                docsLength = JSON.stringify(op.docs).length;
            }

            t[
                `data_${DataDatabaseType[op.databaseType]}_${DataOperationType[
                    op.operationType
                ]}_queryLengths`
            ].push(queryLength);
            t[
                `data_${DataDatabaseType[op.databaseType]}_${DataOperationType[
                    op.operationType
                ]}_optionLengths`
            ].push(optionLength);
            t[
                `data_${DataDatabaseType[op.databaseType]}_${DataOperationType[
                    op.operationType
                ]}_docCount`
            ].push(docCount);
            t[
                `data_${DataDatabaseType[op.databaseType]}_${DataOperationType[
                    op.operationType
                ]}_docLengths`
            ].push(docsLength);
        });

        const props: { [key: string]: string } = {};
        Object.keys(t).forEach(key => {
            props[key] = JSON.stringify(t[key]);
        });

        return props;
    }
);



// WEBPACK FOOTER //
// ./src/client/modules/telemetry/TelemetrySelectors.ts