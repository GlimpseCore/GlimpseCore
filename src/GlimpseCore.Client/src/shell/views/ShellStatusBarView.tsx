import React from 'react';

import styles from './ShellStatusBarView.scss';
import { ThemeBar } from '../themes/views/ThemeBar';
import SmileyButton from '../feedback/views/SmileyButton';
import MessageInputButton from '../input/views/MessageInputButton';
import UpdateBlock from '../update/views/UpdateBlock';
import VersionInfo from '../version/views/VersionInfo';

export interface IShellStatusBarViewProps {
    children?;
}

export class ShellStatusBarView extends React.Component<IShellStatusBarViewProps, {}> {
    public render() {
        return (
            <div className={styles.statusBar}>
                {this.props.children}
                <div className={styles.statusBarGroup}><SmileyButton /></div>
                {DEBUG
                    ? <div className={styles.statusBarGroup}>
                          <MessageInputButton />
                      </div>
                    : undefined}
                {<div className={styles.statusBarGroup}><ThemeBar /></div>}
                <div className={styles.statusBarGroup}><VersionInfo /></div>
                <div className={styles.statusBarGroup}><UpdateBlock /></div>
            </div>
        );
    }
}

export default ShellStatusBarView;



// WEBPACK FOOTER //
// ./src/client/shell/views/ShellStatusBarView.tsx