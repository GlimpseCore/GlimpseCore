import map from 'lodash/_baseMap';
import React from 'react';
import classNames from 'classnames';

import InformationLabel from '@common/components/InformationLabel';
import { toStringWithFixedPoints, roundWithFixedPoints } from '@common/util/StringUtilities';

import styles from './RequestResourceTable.scss';
import commonStyles from '@common/components/Common.scss';

interface IRequestResourceType {
    type: string;
    value: number;
}

export interface IRequestResourceTableProps {
    values: { [key: string]: number };
    valueHeader: string;
    labelHeader: string;
    fixedPoints: number;
    className?: string;
}

const stylesByIndex = [
    styles.requestResourceTableColor1,
    styles.requestResourceTableColor2,
    styles.requestResourceTableColor3,
    styles.requestResourceTableColor4,
    styles.requestResourceTableColor5,
    styles.requestResourceTableColor6,
    styles.requestResourceTableColor7
];

export default class RequestResourceTable extends React.Component<IRequestResourceTableProps, {}> {
    public render() {
        const { labelHeader, values, valueHeader, fixedPoints, className } = this.props;
        const typesList = map(values, (value, type) => ({ type, value }));
        const hasData = typesList.length > 0;
        const alphaSortedTypes = typesList.slice().sort((a, b) => a.type.localeCompare(b.type));
        const valueSortedTypes = typesList.slice().sort((a, b) => b.value - a.value);
        const totalValue = roundWithFixedPoints(
            valueSortedTypes.reduce((prev, curr) => prev + curr.value, 0),
            fixedPoints
        );

        // NOTE: We use separate <tbody>'s to avoid alternating backgrounds for the total row.

        return (
            <div className={className}>
                <table className={commonStyles.table}>
                    <thead>
                        <tr>
                            <th>{labelHeader}</th>
                            <th>{valueHeader}</th>
                        </tr>
                        <tr>
                            <td colSpan={2} className={commonStyles.tableHeadSpacer} />
                        </tr>
                    </thead>
                    <tbody>
                        {hasData
                            ? this.renderResourceRows(
                                  valueSortedTypes,
                                  totalValue,
                                  alphaSortedTypes
                              )
                            : this.renderNoDataRow()}
                    </tbody>
                    <tbody>
                        <tr>
                            <td className={styles.requestResourceTableTotalCell} />
                            <td
                                className={classNames(
                                    styles.requestResourceTableTotalCell,
                                    styles.requestResourceTableValueColumn
                                )}>
                                {hasData ? toStringWithFixedPoints(totalValue, fixedPoints) : ''}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    private renderResourceType(
        resourceType: IRequestResourceType,
        totalValue: number,
        sortedResourceTypes: IRequestResourceType[]
    ) {
        const percentage = resourceType.value / totalValue * 100;
        const roundedPercentageString = toStringWithFixedPoints(percentage, 1) + '%';
        const type = resourceType.type;

        return (
            <div className={styles.requestResourceTableType}>
                <div
                    className={classNames(
                        styles.requestResourceTableTypeIndicator,
                        this.getResourceTypeStyle(resourceType, sortedResourceTypes)
                    )}
                />
                <span
                    className={styles.requestResourceTableTypeName}
                    title={`${type} (${roundedPercentageString})`}>
                    <span>{type}</span>
                    <span className={styles.requestResourceTablePercentage}>
                        &nbsp;({roundedPercentageString})
                    </span>
                </span>
            </div>
        );
    }

    private renderResourceRows(
        resourceTypes: IRequestResourceType[],
        totalValue: number,
        sortedResourceTypes: IRequestResourceType[]
    ) {
        return resourceTypes.map(resourceType => {
            return (
                <tr key={resourceType.type}>
                    <td>
                        {this.renderResourceType(resourceType, totalValue, sortedResourceTypes)}
                    </td>
                    <td className={styles.requestResourceTableValueColumn}>
                        {toStringWithFixedPoints(resourceType.value, this.props.fixedPoints)}
                    </td>
                </tr>
            );
        });
    }

    private renderNoDataRow() {
        return (
            <tr>
                <td colSpan={2}>
                    <InformationLabel
                        text="No data found"
                        annotation="Glimpse did not capture data for this request."
                    />
                </td>
            </tr>
        );
    }

    private getResourceTypeStyle(
        resourceType: IRequestResourceType,
        sortedResourceTypes: IRequestResourceType[]
    ): string {
        const index = sortedResourceTypes.indexOf(resourceType);

        // if (index >= stylesByIndex.length) {
        //     TODO: Report via telemtry that we need more colors?
        // }

        return stylesByIndex[index % stylesByIndex.length];
    }
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/request/views/RequestResourceTable.tsx