import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import styles from './SideBarSection.scss';
import Icon from 'common/components/Icon';
import { toggleFollowModeAction, toggleFilterModeAction } from 'routes/requests/RequestsActions';
import { getFollowMode } from 'routes/requests/RequestsSelector';
import SideBarFilter from './SideBarFilter';
import { IRequestFilterDetails } from 'client/routes/requests/RequestsFilterInterfaces';
import {
    applyFilterStateAction,
    resetFilterStateAction
} from 'client/routes/requests/RequestsFilterActions';
import { IRequestsFilterState } from 'client/routes/requests/RequestsFilterInterfaces';
import { getFilters, isFilterReset } from 'client/routes/requests/RequestsFilterSelectors';

export interface IShellSideBarContainerProps {
    title: string;
    isExpandable?: boolean;
    isImportant?: boolean;
    noChildText?: string;
    requestFilterDetails: IRequestFilterDetails;
    filterMode: boolean;
}

interface IShellSideBarContainerStoreProps {
    followMode: boolean;
    filters: IRequestsFilterState;
}

interface IShellSideBarContainerState {
    filterMode: boolean;
}

interface IShellSideBarContainerCallbacks {
    onToggleFollowMode: () => void;
    onToggleFilterMode: () => void;
    onFilterChange: (filterState: IRequestsFilterState) => void;
    onFilterReset: () => void;
}

class SideBarSection extends React.Component<
    IShellSideBarContainerProps &
        IShellSideBarContainerStoreProps &
        IShellSideBarContainerCallbacks,
    IShellSideBarContainerState
> {
    public static defaultProps = {
        isExpandable: true,
        isImportant: false,
        noChildText: 'No records yet.'
    };

    constructor(props) {
        super(props);

        this.state = {
            filterMode: false
        };
    }

    private toggleFilterMode = () => {
        const { onToggleFilterMode } = this.props;

        onToggleFilterMode();
    };

    public render() {
        const content = this.props.children
            ? this.props.children
            : <div className={styles.sideBarNoRecords}>{this.props.noChildText}</div>;
        const {
            onToggleFollowMode,
            followMode,
            requestFilterDetails,
            onFilterChange,
            onFilterReset,
            filters,
            filterMode
        } = this.props;

        return (
            <div
                className={classNames(styles.sideBar, {
                    [styles.sideBarTitleIsImportant]: this.props.isImportant,
                    [styles.sideBarIsExpandable]: this.props.isExpandable
                })}>
                <div className={styles.sideBarTitleHolder}>
                    <div className={styles.sideBarTitle}>
                        {this.props.title}
                    </div>
                    <div className={styles.sideBarActions}>
                        <Icon
                            shape="FollowMode"
                            className={classNames(styles.sideBarAction, {
                                [styles.sideBarActionActive]: followMode
                            })}
                            onClick={onToggleFollowMode}
                            title="Automatically select the latest HTML request (excluding AJAX requests)."
                        />
                        <Icon
                            shape={isFilterReset(filters) ? 'FilterOutline' : 'FilterFilled'}
                            className={classNames(styles.sideBarAction, {
                                [styles.sideBarActionActive]: filterMode
                            })}
                            onClick={this.toggleFilterMode}
                        />
                    </div>
                </div>

                {filterMode &&
                    <SideBarFilter
                        requestFilterDetails={requestFilterDetails}
                        onFilterChange={onFilterChange}
                        onFilterReset={onFilterReset}
                        filters={filters}
                    />}

                <div className={styles.sideBarContent}>
                    {content}
                </div>
            </div>
        );
    }
}

function mapStateToProps(
    state,
    ownProps: IShellSideBarContainerProps
): Partial<IShellSideBarContainerStoreProps> {
    return {
        followMode: getFollowMode(state),
        filters: getFilters(state)
    };
}

function mapDispatchToProps(
    dispatch,
    ownProps: IShellSideBarContainerProps
): IShellSideBarContainerCallbacks {
    return {
        onToggleFollowMode: () => {
            dispatch(toggleFollowModeAction());
        },
        onToggleFilterMode: () => {
            dispatch(toggleFilterModeAction());
        },
        onFilterChange: (filterState: IRequestsFilterState) => {
            dispatch(applyFilterStateAction(filterState));
        },
        onFilterReset: () => {
            dispatch(resetFilterStateAction());
        }
    };
}

// tslint:disable-next-line:variable-name
const ConnectedSidebarSection: React.ComponentClass<IShellSideBarContainerProps> = connect(
    mapStateToProps,
    mapDispatchToProps
)(SideBarSection);

export default ConnectedSidebarSection;



// WEBPACK FOOTER //
// ./src/client/common/components/SideBarSection.tsx