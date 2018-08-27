import React from 'react'; // tslint:disable-line:no-unused-variable
import classNames from 'classnames';
import { IFilterButtonProps } from '@common/components/FilterButton';

import styles from './Dropdown.scss';

export interface IDropdownOption {
    value: string;
    append?: string;
    disabled?: boolean;
}

interface IOptionProps extends IDropdownOption {}

interface IDropdownProps {
    options: (IDropdownOption | IFilterButtonProps)[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    selected?: string;
    className?: string;
}

// tslint:disable:variable-name
const Option: React.SFC<IOptionProps> = ({ value, append = '', disabled }) => {
    return (
        <option value={value} disabled={disabled}>
            {`${value}${append}`}
        </option>
    );
};

const Dropdown: React.SFC<IDropdownProps> = props => {
    // tslint:disable:variable-name
    const { options, onChange, selected, className } = props;

    return (
        <div className={classNames(styles.dropdown, className)} tabIndex={-1}>
            <select className={styles.select} onChange={onChange} value={selected} title={selected}>
                {options.map((option: IDropdownOption, key) => {
                    return (
                        <Option
                            value={option.value}
                            append={option.append}
                            disabled={option.disabled}
                            key={key}
                        />
                    );
                })}
            </select>
            <div className={styles.header}>
                {' '}{selected}{' '}
            </div>
            <div className={styles.headerPlaceHolder}>
                {selected}
            </div>
            <div className={styles.arrow} />
        </div>
    );
};

export { Dropdown };



// WEBPACK FOOTER //
// ./src/client/common/components/Dropdown.tsx