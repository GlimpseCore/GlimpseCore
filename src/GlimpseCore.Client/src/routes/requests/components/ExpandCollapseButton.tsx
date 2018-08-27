import React from 'react';
import { connect } from 'react-redux';

import { expandAction, collapseAction } from './expansion/ExpansionActions';
import { getExpansionState, isExpanded } from './expansion/ExpansionSelectors';
import { Icon } from '@common/components/Icon';
import { IStoreState } from '@client/IStoreState';

import styles from './ExpandCollapseButton.scss';

export interface IExpandCollapseButtonProps {
    requestId: string;
    elementId: string[];
    title: string;
    expanded?: boolean;
    defaultValue?: boolean;
    visible?: boolean;
}

interface IExpandCollapseButtonCallbacks {
    onToggleExpansion: (expanded: boolean) => void;
}

interface IExpandCollapseButtonCombinedProps extends IExpandCollapseButtonProps, IExpandCollapseButtonCallbacks {}

class ExpandCollapseButtonView extends React.Component<IExpandCollapseButtonCombinedProps, {}> {
    public render() {
        const { expanded, onToggleExpansion, visible = true, title } = this.props;
        const expandCollapseText = expanded ? 'Collapse' : 'Expand';

        if (visible) {
            return (
                <button
                    title={expandCollapseText + ' ' + title}
                    className={styles.expandCollapseButton}
                    onClick={e => onToggleExpansion(!expanded)}>
                    <Icon
                        className={styles.expandCollapseButtonIcon}
                        shape={expanded ? 'CaretDown' : 'CaretRight'}
                    />
                </button>
            );
        } else {
            return <div className={styles.expandCollapseButtonIcon} />;
        }
    }
}

function mapStateToProps(
    state: IStoreState,
    ownProps: IExpandCollapseButtonProps
): IExpandCollapseButtonProps {
    const { elementId, expanded, requestId, title, defaultValue } = ownProps;

    return {
        title,
        elementId,
        expanded: expanded !== undefined
            ? expanded
            : isExpanded(getExpansionState(state), elementId, defaultValue),
        requestId
    };
}

function mapDispatchToProps(
    dispatch,
    ownProps: IExpandCollapseButtonProps
): IExpandCollapseButtonCallbacks {
    const { elementId, requestId } = ownProps;

    return {
        onToggleExpansion: (expanded: boolean) => {
            const action = expanded ? expandAction : collapseAction;

            dispatch(action(requestId, elementId));
        }
    };
}

const ExpandCollapseButton = connect(mapStateToProps, mapDispatchToProps)(ExpandCollapseButtonView); // tslint:disable-line:variable-name

export default ExpandCollapseButton;



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/ExpandCollapseButton.tsx