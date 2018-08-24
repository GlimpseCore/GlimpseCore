import { StatusCodeClass } from './ServiceInterfaces';

export function getStatusCodeShortNames(sc: StatusCodeClass) {
    switch (sc) {
        case StatusCodeClass.Informational:
            return '100s';
        case StatusCodeClass.Success:
            return '200s';
        case StatusCodeClass.Redirection:
            return '300s';
        case StatusCodeClass.ClientError:
            return '400s';
        case StatusCodeClass.ServerError:
            return '500s';
        default:
            return 'Other';
    }
}

export function getStatusCodeRange(sc: StatusCodeClass): number {
    switch (sc) {
        case StatusCodeClass.Informational:
            return 100;
        case StatusCodeClass.Success:
            return 200;
        case StatusCodeClass.Redirection:
            return 300;
        case StatusCodeClass.ClientError:
            return 400;
        case StatusCodeClass.ServerError:
            return 500;
        default:
            return undefined;
    }
}

/**
 * converts a status code value into the corresponding StatusCodeClass
 */
export function convertStatusCodeToStatusCodeClass(statusCode: number): StatusCodeClass {
    let statusCodeClass = StatusCodeClass.None;

    if (statusCode) {
        if (statusCode >= 100 && statusCode < 200) {
            statusCodeClass = StatusCodeClass.Informational;
        } else if (statusCode >= 200 && statusCode < 300) {
            statusCodeClass = StatusCodeClass.Success;
        } else if (statusCode >= 300 && statusCode < 400) {
            statusCodeClass = StatusCodeClass.Redirection;
        } else if (statusCode >= 400 && statusCode < 500) {
            statusCodeClass = StatusCodeClass.ClientError;
        } else if (statusCode >= 500 && statusCode < 600) {
            statusCodeClass = StatusCodeClass.ServerError;
        } else {
            statusCodeClass = StatusCodeClass.Other;
        }
    }
    return statusCodeClass;
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/service/ServiceUtils.ts