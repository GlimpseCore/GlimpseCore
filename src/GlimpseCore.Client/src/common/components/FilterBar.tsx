import React from 'react';
import styles from './FilterBar.scss';
import { IFilterButtonProps, FilterButton } from './FilterButton';
import { Dropdown } from 'common/components/Dropdown';
import { curryCacheFactory } from 'common/util/CurryCache';

export interface IFilterGroupProps {
    name: string;
    filters: IFilterButtonProps[];

    type?: string;
    default?: string;
    className?: string;
}

export interface IFilterBarProps {
    groups: IFilterGroupProps[];
}

export interface IFilterBarCallbacks {
    onShowAll: () => void;
    onToggle: (name: string, groupName: string, index: number) => void;
    onDropdownChange?: (number, e) => void;
}

interface IFilterBarCombinedProps extends IFilterBarProps, IFilterBarCallbacks {}

export class FilterBar extends React.Component<IFilterBarCombinedProps, {}> {
    private curryCacheFunction = curryCacheFactory();

    public render() {
        const { groups, onToggle, onDropdownChange } = this.props;
        const items = [];
        let isFilterApplied = false;

        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];

            if (i > 0) {
                items.push(this.renderSeparator(`${group.name}-group-separator`));
            }

            if (group.type !== 'dropdown') {
                const groupItems = [];

                for (let j = 0; j < group.filters.length; j++) {
                    const filter = group.filters[j];

                    // if one of the filter button is hidden - filter is applied
                    if (filter.isShown === false) {
                        isFilterApplied = true;
                    }

                    groupItems.push(
                        <FilterButton
                            count={filter.count}
                            key={`${group.name}-${filter.name}-button`}
                            icon={filter.icon}
                            iconClassName={filter.iconClassName}
                            iconPathClassName={filter.iconPathClassName}
                            isShown={filter.isShown}
                            name={filter.name}
                            displayName={filter.displayName}
                            onToggle={this.curryCacheFunction(onToggle, filter.name, group.name, j)}
                        />
                    );
                }

                items.push(<div className={group.className}>{groupItems}</div>);
            } else {
                if (group.name !== group.default) {
                    isFilterApplied = true;
                }

                items.push(
                    <div className={group.className}>
                        <Dropdown
                            className={styles.dropdown}
                            onChange={this.curryCacheFunction(onDropdownChange, i)}
                            selected={group.name}
                            options={group.filters}
                        />
                    </div>
                );
            }
        }

        return (
            <div className={styles.filterBar}>
                {items}
                {this.renderResetFilter(isFilterApplied)}
            </div>
        );
    }

    private renderSeparator(key: string) {
        return <div key={key} className={styles.filterGroupSeparator} />;
    }

    private renderResetFilter(isFilterApplied: boolean): Array<JSX.Element> {
        if (!isFilterApplied) {
            return null; // tslint:disable-line:no-null-keyword
        }

        return [
            this.renderSeparator('reset-filters-separator'),
            <button
                key={'reset-filters-button'}
                className={styles.filterShowAll}
                onClick={this.props.onShowAll}>
                Reset filters
            </button>
        ];
    }
}



// WEBPACK FOOTER //
// ./src/client/common/components/FilterBar.tsx