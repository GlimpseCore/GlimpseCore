import React from 'react';
import uniq from 'lodash/uniq';
import classNames from 'classnames';

import JsonTree from './JsonTree';
import commonStyles from '@common/components/Common.scss';
import styles from './JsonTable.scss';

export interface IJsonTableProps {
    model;
    className: string;
    isEvenRow: boolean;
}

export default class JsonTable extends React.Component<IJsonTableProps, {}> {
    /**
     * There are a number of variations in how `console.table` can be called, not
     * all of which are standardized. This method checks to see if the data can
     * be rendered as a table using this component
     */
    public static canRenderMessage(data): boolean {
        const tableData = data[0];
        if (!Array.isArray(tableData)) {
            return false;
        }
        for (const entry of tableData) {
            if (typeof entry !== 'object' || Array.isArray(entry)) {
                return false;
            }
        }
        return true;
    }

    private createCell(columnIndex: number, content, extraStyles?: Array<string>) {
        const className = extraStyles
            ? classNames(styles.jsonTableCell, ...extraStyles)
            : styles.jsonTableCell;
        let fader;
        if (this.props.model.isCollapsed) {
            fader = (
                <div
                    className={classNames(styles.jsonTableFaderEven, {
                        [styles.jsonTableFaderEven]: this.props.isEvenRow,
                        [styles.jsonTableFaderOdd]: !this.props.isEvenRow
                    })}
                />
            );
        }
        return (
            <td key={`col:${columnIndex}`} className={className}>
                <span>{content}</span>
                {fader}
            </td>
        );
    }

    public render() {
        const { payload, messageId, contextId, isCollapsed } = this.props.model;
        const data = payload.message;
        const tableData = data[0];

        // Create the list of columns to include in the table. Note: the second
        // parameter to `console.table` is a list of columns to display, and is
        // optional. If the user supplied this, we use that directly. We do some
        // validation to ensure that columns is either a primitive representing a
        // single column, or an array. These are what are allowed by the actual
        // implementations, and anything else is ignored. If they didn't specify
        // a valid value for columns, then console.table shows the union of all
        // keys from all rows.
        let columns = data[1];
        if (
            typeof columns === 'number' ||
            typeof columns === 'string' ||
            typeof columns === 'boolean'
        ) {
            columns = [columns];
        }
        if (!columns || !Array.isArray(columns)) {
            columns = [];
            for (const entry of tableData) {
                columns.push(...Object.keys(entry));
            }
            columns = uniq(columns);
        }
        columns = ['(index)'].concat(columns);

        // Create the table header. We loop through the entire table so that we
        // can calculate the number of entries for each column.
        const headers = [
            <th className={styles.jsonTableHeaderLabel} key={`col:0`}>
                (index) <span className={styles.jsonTableHeaderCount}>({tableData.length})</span>
            </th>
        ];
        for (let colIndex = 1; colIndex < columns.length; colIndex++) {
            const columnName = columns[colIndex];
            let columnCount = 0;
            for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
                if (tableData[rowIndex].hasOwnProperty(columnName)) {
                    columnCount++;
                }
            }
            headers.push(
                <th className={styles.jsonTableHeaderLabel} key={`col:${colIndex}`}>
                    {columnName}
                    {' '}<span className={styles.jsonTableHeaderCount}>({columnCount})</span>
                </th>
            );
        }

        // Create the filtered data set, based on the columns discerned above.
        const rows = [];
        const rowIterationLimit = isCollapsed ? 1 : tableData.length;
        for (let rowIndex = 0; rowIndex < rowIterationLimit; rowIndex++) {
            const rowData = [this.createCell(0, rowIndex)];
            // We start at index 1 because index 0 is the `'(index)'` entry, which
            // is an artificial column added by `console.table` and is handled above
            for (let colIndex = 1; colIndex < columns.length; colIndex++) {
                const columnName = columns[colIndex];
                // Note: `console.table` does not require that keys be uniform
                // across all rows of data (see column generation above). If a
                // row does not specify a value, we show a blank column to match
                // browser behavior.
                if (!tableData[rowIndex].hasOwnProperty(columnName)) {
                    rowData[colIndex] = <td key={`col:${colIndex}`} />;
                } else {
                    const columnData = tableData[rowIndex][columnName];
                    // tslint:disable-next-line:no-null-keyword
                    if (columnData === null) {
                        rowData[colIndex] = this.createCell(colIndex, 'null');
                    } else if (typeof columnData === 'object') {
                        const obj = (
                            <JsonTree
                                data={columnData}
                                elementId={['logs', messageId, 'tableColumn', colIndex]}
                                requestId={contextId}
                            />
                        );
                        rowData[colIndex] = this.createCell(colIndex, obj, [
                            styles.jsonTableObjectCell
                        ]);
                    } else {
                        rowData[colIndex] = this.createCell(colIndex, columnData);
                    }
                }
            }
            rows.push(<tr key={`row:${rowIndex}`}>{rowData}</tr>);
        }

        return (
            <div className={classNames(styles.jsonTableContainer, this.props.className)}>
                <table className={classNames(commonStyles.table, styles.jsonTable)}>
                    <thead>
                        <tr>{headers}</tr>
                        <tr>
                            <td
                                colSpan={columns.length}
                                className={classNames(
                                    commonStyles.tableHeadSpacer,
                                    styles.jsonTableHeadSpacer
                                )}
                            />
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/JsonTable.tsx