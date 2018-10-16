import React from 'react';
import { connect } from 'react-redux';

import { IStoreState } from '@client/IStoreState';
import { getDebugEnabled } from '@shell/debug/DebugSelectors';
import { toggleDebugEnabled } from '@shell/debug/DebugActions';

import shellStatusBarStyles from '@shell/views/ShellStatusBarView.scss';
import { Icon } from '@common/components/Icon';

interface IDebugBarProps {
    debugEnabled: boolean;
}

interface IDebugBarCallbacks {
    onToggleDebug: () => void;
}

interface IDebugBarCombinedProps extends IDebugBarProps, IDebugBarCallbacks {}

export class DebugButton extends React.Component<IDebugBarCombinedProps, {}> {
    public render() {
        const { debugEnabled, onToggleDebug } = this.props;
        const title = debugEnabled ? 'Start Debugging' : 'Stop Debugging';
        const buttonStyle = debugEnabled
            ? shellStatusBarStyles.statusBarButtonActive
            : shellStatusBarStyles.statusBarButton;

        return (
            <button
                aria-label={title}
                className={buttonStyle}
                type="button"
                onClick={onToggleDebug}>
                <Icon shape="Debug" className={shellStatusBarStyles.statusBarButtonIcon} />
            </button>
        );
    }
}

function mapStateToProps(state: IStoreState): IDebugBarProps {
    return {
        debugEnabled: getDebugEnabled(state)
    };
}

function mapDispatchToProps(dispatch): IDebugBarCallbacks {
    return {
        onToggleDebug: () => {
            dispatch(toggleDebugEnabled());
        }
    };
}

/* tslint:disable-next-line:variable-name */
export default connect(mapStateToProps, mapDispatchToProps)(DebugButton);



// WEBPACK FOOTER //
// ./src/client/shell/debug/views/DebugButton.tsx