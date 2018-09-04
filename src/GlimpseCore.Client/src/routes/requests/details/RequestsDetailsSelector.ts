import * as Glimpse from '@_glimpse/glimpse-definitions';
import { createSelector } from 'reselect';

import { IStoreState } from '@client/IStoreState';
import { IContext, IRequest } from '../RequestsInterfaces';
import { getSelectedContextId, getByContextId, getRequestsLookup } from '../RequestsSelector';

export const getSelectedContext: (state: IStoreState) => IContext = createSelector(
    getSelectedContextId,
    getByContextId,
    (selectedContextId, byContextId) => byContextId[selectedContextId]
);

export const getSelectedRequest: (state: IStoreState) => IRequest = createSelector(
    getSelectedContextId,
    getRequestsLookup,
    (selectedContextId, requests) => requests.byId[selectedContextId]
);

export function calculateDuration(
    webResponse: Glimpse.Messages.Payloads.Web.IResponse,
    browserNavigationTiming: Glimpse.Messages.Payloads.Browser.INavigationTiming
) {
    const serverDuration = webResponse.duration;

    if (browserNavigationTiming) {
        const { loadEventEnd, navigationStart } = browserNavigationTiming;
        const browserDuration = loadEventEnd - navigationStart;

        return loadEventEnd <= 0 || navigationStart <= 0 ? serverDuration : browserDuration;
    }

    return serverDuration;
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/RequestsDetailsSelector.ts