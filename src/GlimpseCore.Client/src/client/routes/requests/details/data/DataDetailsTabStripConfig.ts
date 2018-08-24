import values from 'lodash/values';
import { IDataOperation } from './DataInterfaces';

interface IUrlData {
    requestId: string;
    exchangeId: string;
    requestAxis: string;
    responseAxis: string;
}

export interface IGetTitleOptions {
    dataOperation: IDataOperation;
    axis: string;
}

declare type TitleType = string | ((opts: IGetTitleOptions) => string);

export interface IRouteData {
    title: TitleType;
    getUrl: (data: IUrlData) => string;
    path: string;
    component;
}

export function buildRouteData(
    title: TitleType,
    path: string,
    component,
    isLeft: boolean
): IRouteData {
    return {
        title,
        getUrl: data => {
            const { requestAxis, responseAxis, requestId, exchangeId } = data;
            const operation = isLeft ? path : requestAxis;
            const result = !isLeft ? path : responseAxis;

            return `/requests/${requestId}/data/${exchangeId}?requestAxis=${operation}&responseAxis=${result}`;
        },
        path,
        component
    };
}

export function createRouteConfig(
    operationRouteData: { [key: string]: IRouteData },
    defaultKey: string
) {
    const operationRouteDataList = values<IRouteData>(operationRouteData);

    return {
        getOperationRouteData(): IRouteData[] {
            return operationRouteDataList;
        },
        getOperationRouteMap(): { [key: string]: IRouteData } {
            return operationRouteData;
        },
        default(): IRouteData {
            return operationRouteData[defaultKey];
        }
    };
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataDetailsTabStripConfig.ts