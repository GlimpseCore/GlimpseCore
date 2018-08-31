import React from 'react';
import { connect } from 'react-redux';

import {
    getSelectedOperationSelector,
    getSelectedExchangeId,
    getTotalOperationCountSelector,
    getFilteredByAllOperationsSelector
} from '@routes/requests/details/data/DataSelectors';
import { IDataOperation } from '@routes/requests/details/data/DataInterfaces';
import { IStoreState } from '@client/IStoreState';
import { FilterHeader } from '@common/components/FilterHeader';

import commonStyles from '@common/components/Common.scss';
import serviceStyles from '@routes/requests/details/service/views/Service.scss';
import { DataFilterBar } from './DataFilterBar';
import { DataTable } from './DataTable';
import { getSelectedContextId } from '@routes/requests/RequestsSelector';

interface IDataProps {
    children?;
    selectedOperationId: string;
    totalOperationCount: number;
    filteredOperationCount: number;
    exchange: IDataOperation;
    requestId: string;
}

export class Data extends React.Component<IDataProps, {}> {
    public render() {
        return (
            <div className={serviceStyles.root}>
                {this.renderMaster()}
                {this.renderDetail()}
            </div>
        );
    }

    private renderMaster() {
        const { filteredOperationCount, totalOperationCount } = this.props;

        return (
            <div className={serviceStyles.master}>
                <div className={commonStyles.tabViewHeader}>
                    <FilterHeader
                        count={filteredOperationCount}
                        totalCount={totalOperationCount}
                        eventName="operation"
                    />
                    <div className={commonStyles.tabViewFilterHeader}>
                        <DataFilterBar />
                    </div>
                </div>
                <DataTable className={serviceStyles.table} />
                {this.renderNoEvents()}
            </div>
        );
    }

    private renderNoEvents() {
        const { filteredOperationCount, totalOperationCount } = this.props;

        if (totalOperationCount === 0) {
            return <span className={serviceStyles.masterNoEvents}>No operations detected.</span>;
        } else if (filteredOperationCount === 0) {
            return (
                <span className={serviceStyles.masterNoEvents}>
                    No operations shown. Try changing the filters above.
                </span>
            );
        }

        return undefined;
    }

    private renderDetail() {
        const { children, requestId, exchange } = this.props;

        return exchange
            ? <div className={serviceStyles.detail}>
                  {children && React.cloneElement(children, { exchange, params: { requestId } })}
              </div>
            : undefined;
    }
}

function mapStateToProps(state: IStoreState): IDataProps {
    const exchanges = getFilteredByAllOperationsSelector(state);

    return {
        exchange: getSelectedOperationSelector(state),
        requestId: getSelectedContextId(state),
        selectedOperationId: getSelectedExchangeId(state),
        totalOperationCount: getTotalOperationCountSelector(state),
        filteredOperationCount: exchanges.length
    };
}

export default connect(mapStateToProps)(Data);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/Data.tsx