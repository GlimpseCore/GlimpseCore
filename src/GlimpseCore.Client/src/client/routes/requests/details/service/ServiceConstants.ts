/* closed height of the sidebar - the height when the sidebar is closed */
export const SIDEBAR_CLOSE_HEIGHT = 32;
/* default height of the sidebar */
export const SIDEBAR_NORMAL_HEIGHT = 350;
/* min height of the sidebar - it won't go smaller than this value */
export const SIDEBAR_MIN_HEIGHT = SIDEBAR_CLOSE_HEIGHT;
/* max height of the sidebar - it won't go greater than this value */
export const SIDEBAR_MAX_HEIGHT = +Infinity;
/* threshold `height` for the sidebar on which it will collapse entirely */
export const SIDEBAR_THRESHOLD = 1.5 * SIDEBAR_MIN_HEIGHT;
/* service tab name */
export const SERVICE_TAB_NAME = 'service';
/* resizer `id` it is used in the redux store to locate the resizer data */
export const SERVICE_DETAILS_RESIZER_ID = 'service-details-resizer';



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/service/ServiceConstants.ts