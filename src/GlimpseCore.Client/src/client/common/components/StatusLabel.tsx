import React from 'react';
import * as statuses from 'statuses';

import { Icon } from './Icon';
import styles from './StatusLabel.scss';
import commonStyles from './Common.scss';
import classNames from 'classnames';

interface IStatusLabelProps {
    statusCode: number;
    statusMessage?: string;
    className?: string;
}

export class StatusLabel extends React.Component<IStatusLabelProps, {}> {
    public render() {
        const { statusCode, statusMessage, className } = this.props;
        const rootClassName = classNames(styles.statusLabelContainer, className);
        const statusDescription = typeof statusMessage === 'string'
            ? statusMessage
            : statuses[statusCode];

        // Get the description for the status code, e.g. "Not Found" for 404. If
        // there is no description available, we just use the status code
        let displayStatus;
        if (statusDescription) {
            displayStatus = `${statusCode} ${statusDescription}`;
        } else if (statusCode <= 0) {
            switch (statusCode) {
                case -2:
                    displayStatus = 'Status code unavailable (opaque redirect)';
                    break;
                case -1:
                    displayStatus = 'Status code unavailable (opaque response)';
                    break;
                default:
                    displayStatus = 'Status code unavailable';
                    break;
            }
        } else {
            displayStatus = statusCode;
        }

        // Figure out which icon to use
        let icon;
        if (statusCode <= 0){
            icon = null; // tslint:disable-line:no-null-keyword
        } else if (statusCode < 200) {
            // 200s are considered "info" like
            icon = <Icon shape="Circle" className={styles.statusLabelBlueIcon} />;
        } else if (statusCode < 300) {
            // 200s are considered "info" like
            icon = <Icon shape="Square" className={styles.statusLabelGreenIcon} />;
        } else if (statusCode < 400) {
            // 300s are considered "warning" like
            icon = <Icon shape="Triangle" className={styles.statusLabelYellowIcon} />;
        } else {
            // 400s and 500s are considered "error" like
            icon = <Icon shape="Circle" className={styles.statusLabelRedIcon} />;
        }

        const descriptionClassName = classNames(
            commonStyles.trimText,
            { [styles.statusLabelUnavailableDescription]: statusCode <= 0 }
        );

        return (
            <div title={displayStatus} className={rootClassName}>
                {icon}<span className={descriptionClassName}>{displayStatus}</span>
            </div>
        );
    }
}

export default StatusLabel;



// WEBPACK FOOTER //
// ./src/client/common/components/StatusLabel.tsx