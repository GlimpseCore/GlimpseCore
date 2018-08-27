import { REQUESTS_DETAILS_REQUEST_RESPONSE_TAB_SELECTED } from './RequestResponseTabStripConstants';

import { Action } from 'redux';

export interface ITabSelectedAction extends Action {
    detailAxis: string;
    requestAxis: string;
    responseAxis: string;
}

export function tabSelected(
    detailAxis: string,
    requestAxis: string,
    responseAxis: string
): ITabSelectedAction {
    return {
        type: REQUESTS_DETAILS_REQUEST_RESPONSE_TAB_SELECTED,
        detailAxis,
        requestAxis,
        responseAxis
    };
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/RequestResponseTabStripActions.ts