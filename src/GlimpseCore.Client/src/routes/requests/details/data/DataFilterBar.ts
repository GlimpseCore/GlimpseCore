import { connect } from 'react-redux';

import { getDatabaseFiltersSummaries, getOperationFiltersSummaries } from './DataSelectors';
import { IFilterBarProps, IFilterBarCallbacks, FilterBar } from '@common/components/FilterBar';
import { IStoreState } from '@client/IStoreState';
import {
    toggleDatabaseFilterAction,
    toggleOperationFilterAction,
    showAllAction
} from './DataActions';
import { logError } from '@common/util/Log';

function mapStateToProps(state: IStoreState): IFilterBarProps {
    return {
        groups: [
            {
                name: 'database',
                filters: getDatabaseFiltersSummaries(state)
            },
            {
                name: 'operation',
                filters: getOperationFiltersSummaries(state)
            }
        ]
    };
}

function mapDispatchToProps(dispatch): IFilterBarCallbacks {
    return {
        onShowAll: () => {
            dispatch(showAllAction());
        },
        onToggle: (name: string, groupName: string) => {
            switch (groupName) {
                case 'database':
                    dispatch(toggleDatabaseFilterAction(name));
                    break;
                case 'operation':
                    dispatch(toggleOperationFilterAction(name));
                    break;
                default:
                    logError(`DataFilterBar: unkown groupName: ${groupName}`);
                    break;
            }
        }
    };
}

/* tslint:disable-next-line:variable-name */
export const DataFilterBar = connect(mapStateToProps, mapDispatchToProps)(FilterBar);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataFilterBar.ts