import React from 'react';
import { connect } from 'react-redux';

import { expandAllAction, collapseAllAction } from './expansion/ExpansionActions';
import { Icon } from 'common/components/Icon';
import { IStoreState } from 'client/IStoreState';

import styles from './ExpandCollapseAllBar.scss';

export interface IExpandCollapseAllBarProps {
    /**
     * The ID of the element's associated request.
     */
    requestId: string;

    /**
     * The ID of the element serving as the parent to all elements to be expanded or collapsed.
     */
    parentElementId: string[];
}

export interface IExpandCollapseAllBarCallbacks {
    onExpandAll: () => void;
    onCollapseAll: () => void;
}

interface IExpandCollapseAllBarCombinedProps extends IExpandCollapseAllBarProps, IExpandCollapseAllBarCallbacks {}

export class ExpandCollapseAllBarView extends React.Component<
    IExpandCollapseAllBarCombinedProps,
    {}
> {
    public render() {
        const { onExpandAll, onCollapseAll } = this.props;

        return (
            <div className={styles.expandCollapseAll}>
                <button
                    className={styles.expandCollapseAllButton}
                    title="Expand All"
                    type="button"
                    onClick={e => onExpandAll()}>
                    <Icon shape="ExpandAll" className={styles.expandCollapseAllIcon} />
                </button>
                <button
                    className={styles.expandCollapseAllButton}
                    title="Collapse All"
                    type="button"
                    onClick={e => onCollapseAll()}>
                    <Icon shape="CollapseAll" className={styles.expandCollapseAllIcon} />
                </button>
            </div>
        );
    }
}

function mapStateToProps(
    state: IStoreState,
    ownProps: IExpandCollapseAllBarProps
): IExpandCollapseAllBarProps {
    return ownProps;
}

function mapDispatchToProps(
    dispatch,
    ownProps: IExpandCollapseAllBarProps
): IExpandCollapseAllBarCallbacks {
    const { parentElementId, requestId } = ownProps;

    return {
        onExpandAll: () => {
            dispatch(expandAllAction(requestId, parentElementId));
        },
        onCollapseAll: () => {
            dispatch(collapseAllAction(requestId, parentElementId));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpandCollapseAllBarView); // tslint:disable-line:variable-name



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/ExpandCollapseAllBar.tsx