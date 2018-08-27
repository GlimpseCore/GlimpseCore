import React from 'react';

import styles from './LoggingLabel.scss';

export interface ILoggingLabelProps {
    message: any[] | string | null | undefined; // tslint:disable-line:no-any no-null-keyword
    getLabel?: (message: any[] | string) => any; // tslint:disable-line:no-any no-null-keyword
}

export default class LoggingLabel extends React.Component<ILoggingLabelProps, {}> {
    public render() {
        const { message, getLabel } = this.props;

        const isNamed = message !== undefined && message !== null && message.length > 0; // tslint:disable-line:no-null-keyword

        if (isNamed) {
            return getLabel ? getLabel(message) : <span>{message}</span>;
        } else {
            return <span className={styles.loggingLabelUnnamed}>[unnamed]</span>;
        }
    }
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/logging/views/LoggingLabel.tsx