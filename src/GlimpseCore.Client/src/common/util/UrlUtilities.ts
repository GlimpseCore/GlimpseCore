// NOTE: this module needs to load early in the pipeline so that we can
//       capture the `originalQuery`.
const originalQuery = window.location.search.substring(1);

export function getOriginalQueryStringParam(parameter) {
    return getQueryStringParam(parameter, originalQuery);
}

export function getQueryStringParam(
    parameter,
    query: string = window.location.search.substring(1)
) {
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === parameter) {
            return decodeURIComponent(pair[1]);
        }
    }

    return null;
}

/**
 * isLocalhost - function to check is current host is localhost.
 *
 * @returns {Boolean} If current host is localhost.
 */
export const isLocalhost = (): boolean => {
    const { hostname } = window.location;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
};



// WEBPACK FOOTER //
// ./src/client/common/util/UrlUtilities.ts