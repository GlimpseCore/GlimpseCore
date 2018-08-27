import { createSelector } from 'reselect';

import { IStoreState } from '@client/IStoreState';

const getMetadataState = (state: IStoreState) => state.session.metadata;

export const getVersions = createSelector(getMetadataState, metadata => {
    return metadata.versions || {};
});

export const getClientVersion = createSelector(getVersions, versions => {
    return versions ? versions['client'] : '--'; // tslint:disable-line:no-string-literal
});

export const getConfig = createSelector(getMetadataState, metadata => {
    return metadata.config || {};
});



// WEBPACK FOOTER //
// ./src/client/modules/metadata/MetadataSelectors.ts