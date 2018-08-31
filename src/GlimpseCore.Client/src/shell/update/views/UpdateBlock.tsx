import { connect } from 'react-redux';
import React from 'react';

import { IStoreState } from '@client/IStoreState';

import styles from '../../views/ShellStatusBarView.scss';
import { getUpdateInfo } from '../UpdateSelectors';

interface IUpdateInfoProps {
    shouldShow: boolean;
    newVersion: string;
}

export class UpdateInfo extends React.Component<IUpdateInfoProps, {}> {
    public render() {
        const { shouldShow, newVersion } = this.props;

        if (shouldShow) {
            const title = `Update ${newVersion} is now available`;

            return <span title={title} className={styles.statusBarText}>Update available!</span>;
        }

        return <span />;
    }
}

function mapStateToProps(state: IStoreState): IUpdateInfoProps {
    const updateInfo = getUpdateInfo(state);

    return {
        shouldShow:
            updateInfo.latestVersion !== undefined &&
                updateInfo.latestVersion !== updateInfo.atTimeOfCheckVersion,
        newVersion: updateInfo.latestVersion
    };
}

/* tslint:disable-next-line:variable-name */
export default connect(mapStateToProps, undefined)(UpdateInfo);



// WEBPACK FOOTER //
// ./src/client/shell/update/views/UpdateBlock.tsx