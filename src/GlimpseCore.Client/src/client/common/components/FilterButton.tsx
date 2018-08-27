import React from 'react';
import classNames from 'classnames';

import styles from './FilterButton.scss';
import { Icon } from './Icon';

export interface IFilterButtonProps {
    count: number;
    icon?: IconShapeType;
    iconClassName?: string;
    iconPathClassName?: string;
    isShown: boolean;
    key?: string;
    name: string;
    displayName?: string;
    className?: string;
}

export interface IFilterButtonCallbacks {
    onToggle: (e?) => void;
}

interface IFilterButtonCombinedProps extends IFilterButtonProps, IFilterButtonCallbacks {}

export class FilterButton extends React.Component<IFilterButtonCombinedProps, {}> {
    public render() {
        const { isShown, onToggle, displayName, name, count, className } = this.props;
        const modifier = isShown ? styles.filterButtonShown : styles.filterButtonNotShown;

        return (
            <button
                className={classNames(styles.filterButton, className, modifier)}
                type="button"
                onClick={onToggle}>
                <div className={styles.filterButtonContent}>
                    {this.renderIcon()} {displayName || name} ({count})
                </div>
            </button>
        );
    }

    private renderIcon() {
        const { icon, iconClassName, iconPathClassName } = this.props;

        if (icon) {
            return (
                <Icon
                    className={classNames(
                        styles.filterButtonIcon,
                        iconClassName,
                        iconPathClassName
                    )}
                    shape={icon}
                />
            );
        } else {
            return null; /* tslint:disable-line:no-null-keyword */
        }
    }
}



// WEBPACK FOOTER //
// ./src/client/common/components/FilterButton.tsx