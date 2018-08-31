import React from 'react';
import classNames from 'classnames';

import { Icon } from './Icon';
import styles from './StatusLabel.scss';
import requestMiddlewareStyles from '@client/routes/requests/details/request/views/RequestMiddleware.scss';
import commonStyles from './Common.scss';
import { DataOperationStatus } from '@client/routes/requests/details/data/DataInterfaces';

interface IDataStatusLabelProps {
    statusCode: DataOperationStatus;
    statusMessage: string;
    className?: string;
}

export class DataStatusLabel extends React.Component<IDataStatusLabelProps, {}> {
    public render() {
        const { statusCode, statusMessage, className } = this.props;
        const isTypeMessage =
            statusMessage[0] === '[' && statusMessage[statusMessage.length - 1] === ']';

        const rootClassName = classNames(styles.statusLabelContainer, className, {
            [requestMiddlewareStyles.middlewareNameAnonymous]: isTypeMessage
        });

        let icon;
        if (statusCode === DataOperationStatus.OK) {
            icon = <Icon shape="Circle" className={styles.statusLabelGreenIcon} />;
        } else if (statusCode === DataOperationStatus.Error) {
            icon = <Icon shape="Circle" className={styles.statusLabelRedIcon} />;
        } else if (statusCode === DataOperationStatus.Warning) {
            icon = <Icon shape="Circle" className={styles.statusLabelYellowIcon} />;
        }

        return (
            <div title={statusMessage} className={rootClassName}>
                {icon}<span className={commonStyles.trimText}>{statusMessage}</span>
            </div>
        );
    }
}

export default DataStatusLabel;



// WEBPACK FOOTER //
// ./src/client/common/components/DataStatusLabel.tsx