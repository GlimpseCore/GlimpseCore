import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { IStoreState } from '@client/IStoreState';
import { getSelectedThemeName } from '../themes/ThemesSelectors';

import styles from './ShellView.scss';
import ShellActivityBarView from './ShellActivityBarView';
import ShellStatusBarView from './ShellStatusBarView';
import SmileyFeedback from '@shell/feedback/views/SmileyFeedback';
import { Dialog } from '@client/shell/rating-dialog/views/RatingDialog';

export interface IShellViewProps {
    messages;
    children;
    themeName: string;
}

export class ShellView extends React.Component<IShellViewProps, {}> {
    public render() {
        const { themeName, children, messages } = this.props;

        return (
            <div className={classNames(themeName, styles.shell)}>
                <div className={styles.shellContent}>
                    <div className={classNames(styles.shellContentActivityBar)}>
                        <ShellActivityBarView children={null} />
                    </div>
                    <div className={styles.shellContentDetail}>
                        <SmileyFeedback />
                        {children && React.cloneElement(children, { messages })}
                    </div>
                </div>
                <div className={styles.shellStatusBar}>
                    <ShellStatusBarView />
                </div>
                <Dialog />
            </div>
        );
    }
}

function mapStateToProps(state: IStoreState, ownProps) {
    return {
        themeName: getSelectedThemeName(state)
    };
}

export default connect(mapStateToProps)(ShellView);



// WEBPACK FOOTER //
// ./src/client/shell/views/ShellView.tsx