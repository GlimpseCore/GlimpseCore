// tslint:disable-next-line:no-unused-variable
import React from 'react';

import commonStyles from 'common/components/Common.scss';

interface IFilterHeaderProps {
    count: number;
    totalCount: number;
    eventName: string;
}

// tslint:disable-next-line:variable-name
export const FilterHeader = (props: IFilterHeaderProps): JSX.Element => {
    const { count, totalCount, eventName } = props;
    const events = (totalCount === 1) ? eventName : `${eventName}s`;

    return (
        <h3 className={commonStyles.detailTitle}>
            {count === totalCount ? `${count} ${events}` : `${count} of ${totalCount} ${events}`}
        </h3>
    );
};



// WEBPACK FOOTER //
// ./src/client/common/components/FilterHeader.tsx