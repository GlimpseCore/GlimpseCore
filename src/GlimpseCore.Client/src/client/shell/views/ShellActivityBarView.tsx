import React from 'react';
import { connect } from 'react-redux';

import { toggleOpenState } from 'common/components/resize/Resize';
import { REQUESTS_SIDEBAR_RESIZER_ID } from 'client/routes/requests/RequestsResizeConstants';
import { Icon } from 'common/components/Icon';

import styles from './ShellActivityBarView.scss';

export interface IProps {
    children;
}
export interface ICallbacks {
    onToggle: (e) => void;
}

export class ShellActivityBarView extends React.Component<IProps & ICallbacks, {}> {
    public render() {
        return (
            <div className={styles.activityBar}>
                <div
                    onClick={this.props.onToggle}
                    title="Request List"
                    className={`${styles.activityBarButton} ${styles.activityBarButtonActive}`}>
                    <Icon shape="Bars" className={styles.activityBarIcon} />
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch): ICallbacks {
    return {
        onToggle: e => {
            dispatch(toggleOpenState({ id: REQUESTS_SIDEBAR_RESIZER_ID }));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(ShellActivityBarView);



// WEBPACK FOOTER //
// ./src/client/shell/views/ShellActivityBarView.tsx