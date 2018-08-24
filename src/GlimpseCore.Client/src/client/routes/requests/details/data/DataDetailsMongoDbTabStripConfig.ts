import { DataDetailsConnection } from './DataDetailsConnection';
import { DataDetailsSummary } from './DataDetailsSummary';
import { DataDetailsOptions } from './DataDetailsOptions';
import { DataOperationType } from './DataInterfaces';

import { DataDetailsMongoCodeJson, documentsTabName } from './DataDetailsMongoCodeJson';

import {
    buildRouteData,
    createRouteConfig,
    IRouteData,
    IGetTitleOptions
} from './DataDetailsTabStripConfig';

function getTitle(titleOptions: IGetTitleOptions): string {
    switch (titleOptions.dataOperation.operationType) {
        case DataOperationType.Update:
            return 'Updates';
        case DataOperationType.Create:
            return 'Documents';
        default:
            // TODO:  ideally we'd make this tab invisible, not sure what to do here...
            return 'Documents';
    }
}

export const docRouteData = buildRouteData(
    getTitle,
    documentsTabName,
    DataDetailsMongoCodeJson,
    true
);
export const queryRouteData = buildRouteData('Query', 'query', DataDetailsMongoCodeJson, true);
export const paramsRouteData = buildRouteData('Options', 'options', DataDetailsOptions, true);

export const generalInfoRouteData = buildRouteData('Summary', 'summary', DataDetailsSummary, false);
export const connectionRouteData = buildRouteData(
    'Connection',
    'connection',
    DataDetailsConnection,
    false
);

const leftRouteData: { [key: string]: IRouteData } = {};

leftRouteData[docRouteData.path] = docRouteData;
leftRouteData[queryRouteData.path] = queryRouteData;
leftRouteData[paramsRouteData.path] = paramsRouteData;

const rightRouteData: { [key: string]: IRouteData } = {};

rightRouteData[generalInfoRouteData.path] = generalInfoRouteData;
rightRouteData[connectionRouteData.path] = connectionRouteData;

export const mongoLeftSectionConfig = createRouteConfig(leftRouteData, 'query');
export const mongoRightSectionConfig = createRouteConfig(rightRouteData, 'summary');



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataDetailsMongoDbTabStripConfig.ts