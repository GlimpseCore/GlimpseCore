// tslint:disable:no-unused-variable
import React from 'react';
import classNames from 'classnames';

import styles from './RatingDialog.scss';

// tslint:disable:variable-name
export const RatingThankYouDialog = (props) => {
    return (
        <div className={classNames(styles.dialog, styles.isThanks)}>
            <div className={styles.section}>
                <label className={classNames(styles.label, styles.isBold)}>
                    <span className={styles.tick}>✔</span> Your message was perfectly sent!
                </label>
            </div>
            <div className={styles.section}>
                <label>I will check in with you in a bit, hope you have fun.</label>
            </div>
        </div>
    );
};



// WEBPACK FOOTER //
// ./src/client/shell/rating-dialog/views/RatingThankYouDialog.tsx