import { DataDetailsConnection } from './DataDetailsConnection';
import { DataDetailsResult } from './DataDetailsResult';
import { DataDetailsQuery } from './DataDetailsQuery';
import { DataDetailsOptions } from './DataDetailsOptions';

import { buildRouteData, createRouteConfig, IRouteData } from './DataDetailsTabStripConfig';

export const queryRouteData = buildRouteData('Command', 'query', DataDetailsQuery, true);
export const paramsRouteData = buildRouteData('Arguments', 'options', DataDetailsOptions, true);

export const generalInfoRouteData = buildRouteData('Result', 'summary', DataDetailsResult, false);
export const connectionRouteData = buildRouteData(
    'Connection',
    'connection',
    DataDetailsConnection,
    false
);

const leftRouteData: { [key: string]: IRouteData } = {};

leftRouteData[queryRouteData.path] = queryRouteData;
leftRouteData[paramsRouteData.path] = paramsRouteData;

const rightRouteData: { [key: string]: IRouteData } = {};

rightRouteData[generalInfoRouteData.path] = generalInfoRouteData;
rightRouteData[connectionRouteData.path] = connectionRouteData;

export const redisLeftSectionConfig = createRouteConfig(leftRouteData, 'query');
export const redisRightSectionConfig = createRouteConfig(rightRouteData, 'summary');



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataDetailsRedisTabStripConfig.ts