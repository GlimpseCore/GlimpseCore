import { StatusCodeClass } from '../ServiceInterfaces';

import styles from './ServiceCommon.scss';

const statusCodeColors = {
    [StatusCodeClass.ClientError]: styles.statusCodeClientErrorColor,
    [StatusCodeClass.Informational]: styles.statusCodeInformationalColor,
    [StatusCodeClass.Other]: styles.statusCodeOtherColor,
    [StatusCodeClass.Redirection]: styles.statusCodeRedirectionColor,
    [StatusCodeClass.ServerError]: styles.statusCodeServerErrorColor,
    [StatusCodeClass.Success]: styles.statusCodeSuccessColor
};

const statusCodeIcons = {
    [StatusCodeClass.ClientError]: 'Circle',
    [StatusCodeClass.Informational]: 'Circle',
    [StatusCodeClass.Other]: 'Triangle',
    [StatusCodeClass.Redirection]: 'Triangle',
    [StatusCodeClass.ServerError]: 'Circle',
    [StatusCodeClass.Success]: 'Square'
};

export function getColorStyleForStatusCode(statusCode: StatusCodeClass): string {
    return statusCodeColors[statusCode] || styles.statusCodeOtherColor;
}

export function getIconForStatusCode(statusCode: StatusCodeClass): IconShapeType {
    return (statusCodeIcons[statusCode] as IconShapeType) || 'Triangle';
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/service/views/ServiceCommon.ts