import React from 'react'; // tslint:disable-line:no-unused-variable
import classNames from 'classnames';

import Icon from 'common/components/Icon';

import styles from './TimelineSlownessIcon.scss';

// tslint:disable-next-line:variable-name
export const TimelineSlownessIcon = (props: { className?: string; slowness?: number }) => {
    const { className, slowness } = props;
    const shape = slowness >= 1 && slowness <= 3 ? 'Fire' : undefined;

    let colorClassName;
    let title;
    switch (slowness) {
        case 1:
            colorClassName = styles.isIconSlowest;
            title = 'Slowest event';
            break;

        case 2:
            colorClassName = styles.isIconSlower;
            title = '2nd slowest event';
            break;

        case 3:
            colorClassName = styles.isIconSlow;
            title = '3rd slowest event';
            break;

        default:
            colorClassName = undefined;
            break;
    }

    return (
        <div className={className} title={title}>
            <Icon
                shape={shape}
                className={classNames(styles.timelineSlownessIcon, colorClassName)}
            />
        </div>
    );
};

export default TimelineSlownessIcon;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/views/TimelineSlownessIcon.tsx