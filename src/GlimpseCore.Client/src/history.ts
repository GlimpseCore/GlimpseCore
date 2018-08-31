import { createHistory } from 'history';
import { useRouterHistory } from 'react-router';

import { getOriginalQueryStringParam } from './common/util/UrlUtilities';

export const baseUrlProperty = 'baseUrl';

export const basename = getOriginalQueryStringParam(baseUrlProperty);

export const browserHistory = useRouterHistory(createHistory)({
    basename
});



// WEBPACK FOOTER //
// ./src/client/history.ts