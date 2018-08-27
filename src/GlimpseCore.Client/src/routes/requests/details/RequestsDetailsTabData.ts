//import { isExperimentalMode } from 'common/util/ConfigurationUtilities';
import { processTabs } from 'common/config/config-processor';

import dataConfig from './data/DataConfig';
import debugConfig from './debug/DebugConfig';

import requestConfig from './request/RequestConfig';
import timelineConfig from './timeline/TimelineConfig';
import loggingConfig from './logging/requests-details-logging-config';
import serviceConfig from './service/ServiceConfig';

export const childConfigs = [
    requestConfig,
    timelineConfig,
    loggingConfig,
    serviceConfig,
    dataConfig
];

//
//  If a tab is "experimental", than remove from above list & add it in block below.
//
// if (isExperimentalMode()) {
//     childConfigs.push(dataConfig as any); // tslint:disable-line:no-any
// }

if (DEBUG) {
    childConfigs.push(debugConfig);
}

export const tabData = processTabs(childConfigs);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/RequestsDetailsTabData.ts