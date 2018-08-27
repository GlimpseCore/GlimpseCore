import React from 'react';
import classNames from 'classnames';

import styles from './Icon.scss';

interface IIconProps {
    shape: IconShapeType;
    title?: string;
    className?: string;
    pathClassName?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
}

export class Icon extends React.Component<IIconProps, {}> {
    public render() {
        const { shape, className, onClick, onKeyDown, title } = this.props;

        const ariaLabel = this.props['aria-label'];

        return (
            <div
                className={classNames(styles.icon, className)}
                onClick={onClick}
                onKeyDown={onKeyDown}
                aria-label={ariaLabel}
                title={title}>
                <svg>
                    <use xlinkHref={`#${shape}-shape`} />
                </svg>
            </div>
        );
    }
}

export default Icon;



// WEBPACK FOOTER //
// ./src/client/common/components/Icon.tsx