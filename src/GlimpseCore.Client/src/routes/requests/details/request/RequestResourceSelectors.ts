import * as Glimpse from '@glimpse/glimpse-definitions';
import mapValues from 'lodash/mapValues';
import groupBy from 'lodash/groupBy';
import flatten from 'lodash/flatten';
import { createSelector } from 'reselect';

import { getMessageByType } from '@routes/requests/RequestsSelector';
import { getSelectedContext } from '../RequestsDetailsSelector';

export function toResourceType(
    resource: Glimpse.Messages.Payloads.Browser.IResourceTiming
): string {
    return resource.initiatorType.length ? resource.initiatorType.toLowerCase() : 'other';
}

export const getBrowserResources = createSelector(getSelectedContext, selectedContext => {
    if (selectedContext) {
        return flatten(
            getMessageByType<Glimpse.Messages.Payloads.Browser.IResource>(
                selectedContext.byType,
                Glimpse.Messages.Payloads.Browser.ResourceType
            ).map(message => message.payload.timings)
        );
    } else {
        return [];
    }
});

export const getBrowserResourcesByType = createSelector(getBrowserResources, browserResources => {
    return groupBy(browserResources, toResourceType);
});

function filterInvalidValues(obj) {
    const filteredObj = { ...obj };
    for (const p in filteredObj) {
        if (!filteredObj.hasOwnProperty(p)) {
            continue;
        }
        if (isNaN(filteredObj[p])) {
            delete filteredObj[p];
        }
    }
    return filteredObj;
}

export const getBrowserResourceTypeData = createSelector(
    getBrowserResourcesByType,
    browserResourcesByType => ({
        counts: filterInvalidValues(
            mapValues(browserResourcesByType, resources => resources.length)
        ),
        durations: filterInvalidValues(
            mapValues(browserResourcesByType, resources =>
                resources.reduce((acc, resource) => acc + resource.duration, 0)
            )
        ),
        sizes: filterInvalidValues(
            mapValues(browserResourcesByType, resources =>
                resources.reduce((acc, resource) => acc + resource.transferSize, 0)
            )
        )
    })
);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/request/RequestResourceSelectors.ts