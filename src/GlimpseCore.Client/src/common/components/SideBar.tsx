import React from 'react';

//import styles from './SideBar.scss';
import './SideBar.scss';

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
            <div className={"rightButton"} onClick={rightButtonOnClick}>
                {rightButtonTitle}
            </div>
        );
    };
    public render() {
        const { title, children } = this.props;

        return (
            <div className="sideBar">
                <div className="title">
                    <div className="titleRequests"> {title} </div>
                    {this.renderRightButton()}
                    <label className="calis">A ver si pinta</label>
                </div>
                {children}
            </div>
        );
    }
}

export default SideBar;



// WEBPACK FOOTER //
// ./src/client/common/components/SideBar.tsx