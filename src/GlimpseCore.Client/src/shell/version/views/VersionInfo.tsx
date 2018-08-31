import React from 'react';
import { connect } from 'react-redux';

import { IStoreState } from '@client/IStoreState';
import { getVersions, getClientVersion } from '@modules/metadata/MetadataSelectors';

import styles from '../../views/ShellStatusBarView.scss';

interface IVersionInfoProps {
    allVersions: {
        [key: string]: string;
    };
    clientVersion: string;
}

export class VersionInfo extends React.Component<IVersionInfoProps, {}> {
    public render() {
        const { clientVersion, allVersions } = this.props;

        const title = Object.keys(allVersions).map(key => `${key}: ${allVersions[key]}`).join('\n');

        return <span title={title} className={styles.statusBarText}>{clientVersion}</span>;
    }
}

function mapStateToProps(state: IStoreState): IVersionInfoProps {
    return {
        allVersions: getVersions(state),
        clientVersion: getClientVersion(state)
    };
}

/* tslint:disable-next-line:variable-name */
export default connect(mapStateToProps, undefined)(VersionInfo);



// WEBPACK FOOTER //
// ./src/client/shell/version/views/VersionInfo.tsx