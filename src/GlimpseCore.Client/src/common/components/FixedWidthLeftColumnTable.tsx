import React from 'react';
import classNames from 'classnames';
import { Table, Column, Cell } from 'fixed-data-table-2';
import '../lib/fixed-data-table.css';
import Measure from 'react-measure';
import { measureTextWidth } from '@common/util/TextUtilities';
import styles from './FixedWidthLeftColumnTable.scss';
import commonStyles from './Common.scss';

export interface IColumnInfo {
    /**
     * The text shown in the header for this column.
     */
    header: string;

    /**
     * (Optional) Whether this column is fixed or scrolls.
     *
     * Notes:
     *
     *  - If omitted, the first column will be fixed, and all others will not.
     */
    isFixed?: boolean;

    /**
     * (Optional) The maximum width for this column
     *
     * - If omitted, the cell will grow as large as it needs to be to fit contents.
     */
    maxWidth?: number;

    /**
     * (Optional) If valueFunc() returns a React element, this function returns its (approximate) width, in pixels.
     *
     * Notes:
     *
     *  - This function will be used to determine the overall width of this column.
     */
    measureFunc?: (param: Object) => number;

    /**
     * (Optional) If valueFunc() returns a React element that's simply styled text, this function returns the raw text.
     *
     * Notes:
     *  - This function will be used to determine the overall width of this column.
     */
    textFunc?: (param: Object) => string;

    /**
     * (Optional) This function returns the raw title text.
     */
    titleFunc?: (param: Object) => string;

    /**
     * The text or React element that represents the specified parameter in this column.
     *
     * Notes:
     *
     *  - If this function returns a string, the length of that string will be used to determine the overall width of this column.
     *  - If this function returns a React element, specify measureFunc() or textFunc() to provide its width.
     */
    valueFunc: (param: Object) => string | JSX.Element;
}

export interface ITableProps {
    className?: string;
    columns: IColumnInfo[];
    params: Object[];
}

export interface ITableState {
    tableDimensions?: {
        width: number;
        height: number;
    };
    columnWidths?: number[];
}

export const nameValueColumns: IColumnInfo[] = [
    {
        header: 'Name',
        valueFunc: (o: { name: string; value: string }) => {
            return o.name;
        },
        titleFunc: (o: { name: string; value: string }) => {
            return o.name;
        },
        maxWidth: 200
    },
    {
        header: 'Value',
        valueFunc: (o: { name: string; value: string }) => {
            return o.value;
        }
    }
];

export class FixedWidthLeftColumnTable extends React.Component<ITableProps, ITableState> {
    private tableContainer: HTMLDivElement;

    constructor(props) {
        super(props);

        this.state = {
            tableDimensions: {
                width: -1,
                height: -1
            },
            columnWidths: []
        };
    }

    public componentDidMount() {
        const { columns, params } = this.props;

        this.setColumnWidths(columns, params);
    }

    public componentWillReceiveProps(nextProps: ITableProps) {
        const { columns: oldColumns, params: oldParams } = this.props;
        const { columns: nextColumns, params: nextParams } = nextProps;

        if (oldColumns !== nextColumns || oldParams !== nextParams) {
            this.setColumnWidths(nextColumns, nextParams);
        }
    }

    public render() {
        const { params, className, columns } = this.props;
        const { tableDimensions: { width, height }, columnWidths } = this.state;

        let content: JSX.Element;
        if (width > 0) {
            content = (
                <Table
                    rowHeight={26}
                    rowsCount={params.length}
                    width={width}
                    height={height}
                    headerHeight={26}
                    onColumnResizeEndCallback={this.onColumnResize}
                    isColumnResizing={false}>
                    {columns.map((column, columnIndex) => {
                        return (
                            <Column
                                header={
                                    <Cell>
                                        {column.header}
                                    </Cell>
                                }
                                cell={props => {
                                    const title = column.titleFunc
                                        ? column.titleFunc(params[props.rowIndex])
                                        : '';

                                    return (
                                        <Cell {...props}>
                                            <div
                                                style={{ width: columnWidths[columnIndex] - 20 }}
                                                className={commonStyles.trimText}
                                                title={title}>
                                                {column.valueFunc(params[props.rowIndex])}
                                            </div>
                                        </Cell>
                                    );
                                }}
                                width={columnWidths[columnIndex]}
                                fixed={
                                    column.isFixed !== undefined
                                        ? column.isFixed
                                        : columnIndex === 0
                                }
                                isResizable={true}
                                columnKey={columnIndex}
                                key={columnIndex}
                            />
                        );
                    })}
                </Table>
            );
        }

        return (
            <Measure onMeasure={this.onTableMeasure}>
                <div
                    className={classNames(styles.fixedWidthLeftColumnTableContainer, className)}
                    ref={e => (this.tableContainer = e)}>
                    {content}
                </div>
            </Measure>
        );
    }

    private setColumnWidths(columns: IColumnInfo[], params: Object[]) {
        const columnWidths = [];

        let totalColumnWidth = 0;
        for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
            const column = columns[columnIndex];

            let widestColumnCell: number;

            if (column.measureFunc) {
                widestColumnCell = params
                    .map(param => column.measureFunc(param))
                    .reduce((prev, paramWidth) => Math.max(prev, paramWidth), 0);
            } else {
                const longestColumnCell = params
                    .map(
                        param =>
                            (column.textFunc ? column.textFunc : column.valueFunc)(param) as string
                    )
                    .reduce(
                        (prev, value) => (value && value.length > prev.length ? value : prev),
                        ''
                    );

                widestColumnCell = FixedWidthLeftColumnTable.getTextWidth(longestColumnCell);
            }

            const headerWidth = FixedWidthLeftColumnTable.getTextWidth(column.header);

            // A column's width should be the maximum of its header width and any of its cells.
            columnWidths[columnIndex] = Math.max(widestColumnCell, headerWidth);

            if (typeof column.maxWidth === 'number') {
                columnWidths[columnIndex] = Math.min(columnWidths[columnIndex], column.maxWidth);
            }

            totalColumnWidth += columnWidths[columnIndex];
        }

        // We check if all of the table columns ended up to short for the available
        // space, and if so extend the last column. This way, the even colored
        // row background extends to the edge.
        const tableContainerRect = this.tableContainer.getBoundingClientRect();
        if (totalColumnWidth < tableContainerRect.width) {
            columnWidths[columnWidths.length - 1] += tableContainerRect.width - totalColumnWidth;
        }

        this.setState({
            columnWidths
        });
    }

    private static getTextWidth(text: string): number {
        return measureTextWidth({ text, size: '13px' }) + 24; // We need to account for padding, so we add some extra
    }

    private onTableMeasure = (dimensions: Measure.Dimensions) => {
        this.setState({
            tableDimensions: {
                width: dimensions.width,
                height: dimensions.height
            }
        });
    };

    private onColumnResize = (width, key) => {
        const { columnWidths } = this.state;
        columnWidths[key] = width;
        this.setState({
            columnWidths
        });
    };
}



// WEBPACK FOOTER //
// ./src/client/common/components/FixedWidthLeftColumnTable.tsx