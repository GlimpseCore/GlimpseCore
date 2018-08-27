import React from 'react';

import styles from './SideBar.scss';

export interface IShellSideBarProps {
    title: string;
    rightButtonTitle?: string;
}

interface IShellSideBarCallbacks {
    rightButtonOnClick?: () => void;
}

export class SideBar extends React.Component<IShellSideBarProps & IShellSideBarCallbacks, {}> {
    private renderRightButton = () => {
        const { rightButtonTitle, rightButtonOnClick } = this.props;

        if (!rightButtonOnClick || !rightButtonTitle) {
            return null; // tslint:disable-line:no-null-keyword
        }

        return (
            <div className={styles.rightButton} onClick={rightButtonOnClick}>
                {rightButtonTitle}
            </div>
        );
    };
    public render() {
        const { title, children } = this.props;

        return (
            <div className={styles.sideBar}>
                <div className={styles.title}>
                    <div className={styles.titleRequests}> {title} </div>
                    {this.renderRightButton()}
                </div>
                {children}
            </div>
        );
    }
}

export default SideBar;



// WEBPACK FOOTER //
// ./src/client/common/components/SideBar.tsx