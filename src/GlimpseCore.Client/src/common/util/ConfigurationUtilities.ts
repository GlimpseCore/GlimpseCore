import { getOriginalQueryStringParam } from './UrlUtilities';

export function isExperimentalMode(): boolean {
    const isExperimentalMode = getOriginalQueryStringParam('experimentalMode');
    return isExperimentalMode === 'true';
}



// WEBPACK FOOTER //
// ./src/client/common/util/ConfigurationUtilities.ts