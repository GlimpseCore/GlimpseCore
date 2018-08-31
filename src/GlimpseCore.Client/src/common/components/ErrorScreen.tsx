import React from 'react'; // tslint:disable-line:no-unused-variable
import classNames from 'classnames';

import { stateKey } from '@client/Reducers';

import styles from './ErrorScreen.scss';

const onReload = () => {
    window.location.reload();
};

const onReset = () => {
    localStorage.removeItem(stateKey);
    onReload();
};

// tslint:disable:variable-name
const ErrorScreen = () => {
    return (
        <div className={styles.errorScreen}>
            <div className={styles.imageWithText}>
                <div className={styles.image} />
                <div className={styles.description}>
                    Something went really wrong. We're already working to fix this.
                </div>
                <div className={styles.buttons}>
                    <button
                        className={styles.button}
                        onClick={onReload}>Reload</button>
                    <button
                        className={classNames(styles.button, styles.isResetButton)}
                        onClick={onReset}>Reset</button>
                </div>
            </div>
        </div>
    );
};

export { ErrorScreen };



// WEBPACK FOOTER //
// ./src/client/common/components/ErrorScreen.tsx