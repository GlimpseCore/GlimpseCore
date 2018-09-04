import * as Glimpse from '@_glimpse/glimpse-definitions';
import { createSelector } from 'reselect';
import { getNamesForEnum } from '@common/util/CommonUtilities';

import { IMessage } from '@modules/messages/schemas/IMessage';
import { IStoreState } from '@client/IStoreState';
import { getServerOffsetFactor } from '../request/RequestSelectors';
import { getSelectedContext } from '../RequestsDetailsSelector';
import { IContext } from '@routes/requests/RequestsInterfaces';
import { getMessageByType } from '@routes/requests/RequestsSelector';
import {
    IDataOperation,
    IDataFiltersState,
    DataDatabaseType,
    DataOperationType
} from './DataInterfaces';
import {
    createMongoDbInsertOperation,
    createMongoDbUpdateOperation,
    createMongoDbDeleteOperation,
    getMongoDbReadOperations
} from './DataMongoDbSelectors';
import { createRedisOperations } from './DataRedisSelectors';
import { getSelectedRequestPersistedState } from '@routes/requests/RequestsSelector';

function getDataOperations<T>(
    request: IContext,
    offsetFactor: number,
    messageType: string,
    selector: (message: IMessage<T>, offsetFactor: number) => IDataOperation
): IDataOperation[] {
    const messages = getMessageByType<T>(request.byType, messageType);

    return messages.map(message => {
        return selector(message, offsetFactor);
    });
}

export const getOperations = createSelector(
    getSelectedContext,
    getServerOffsetFactor,
    (selectedContext: IContext, offsetFactor: number): IDataOperation[] => {
        if (selectedContext) {
            return (
                []
                    /* The commented out code might be needed in future when we will add `MySQL` support. */
                    // .concat(getSqlOperations(selectedContext, offsetFactor))

                    /* MongoDB */

                    .concat(
                        getDataOperations(
                            selectedContext,
                            offsetFactor,
                            Glimpse.Messages.Payloads.Data.Store.Mongodb.InsertType,
                            createMongoDbInsertOperation
                        )
                    )
                    .concat(getMongoDbReadOperations(selectedContext, offsetFactor))
                    .concat(
                        getDataOperations(
                            selectedContext,
                            offsetFactor,
                            Glimpse.Messages.Payloads.Data.Store.Mongodb.UpdateType,
                            createMongoDbUpdateOperation
                        )
                    )
                    .concat(
                        getDataOperations(
                            selectedContext,
                            offsetFactor,
                            Glimpse.Messages.Payloads.Data.Store.Mongodb.DeleteType,
                            createMongoDbDeleteOperation
                        )
                    )
                    /* Redis */

                    .concat(createRedisOperations(selectedContext, offsetFactor))
                    .sort((a, b) => a.ordinal - b.ordinal)
            );
        }

        return [];
    }
);

/**
 * returns the current filters state.
 */
const getFiltersState = (state: IStoreState): IDataFiltersState =>
    state.persisted.global.requests.details.data.filters;
/**
 * returns the current filters state for the by-database filters.
 */
const getDatabaseFiltersState = createSelector(
    getFiltersState,
    (filters: IDataFiltersState) => filters.database
);
/**
 * returns the current filters state for the by-operation filters.
 */
const getOperationFiltersState = createSelector(
    getFiltersState,
    (filters: IDataFiltersState) => filters.operation
);

/**
 * returns the currently selected exchange ID for the currently selected request
 */
export const getSelectedExchangeId = createSelector(
    getSelectedRequestPersistedState,
    selectedRequestPersistedState => {
        return selectedRequestPersistedState
            ? selectedRequestPersistedState.details.data.selectedExchangeId
            : undefined;
    }
);

export const getTotalOperationCount = (operations: IDataOperation[]): number => {
    return operations.length;
};

export const getTotalOperationCountSelector = createSelector(getOperations, getTotalOperationCount);

export const getFilteredByDatabaseOperations = (
    filterState,
    operations: IDataOperation[]
): IDataOperation[] => {
    const filteredOperations: IDataOperation[] = [];
    const { database: databaseFilter } = filterState;

    operations.forEach((operation, index) => {
        const database = DataDatabaseType[operation.databaseType];

        if (databaseFilter[database]) {
            filteredOperations.push({
                ...operation,
                index: index + 1
            });
        }
    });

    return filteredOperations;
};

export const getFilteredByDatabaseOperationsSelector = createSelector(
    getFiltersState,
    getOperations,
    getFilteredByDatabaseOperations
);

export const getFilteredByAllOperations = (
    filterState,
    operations: IDataOperation[]
): IDataOperation[] => {
    const filteredOperations: IDataOperation[] = [];
    const { database: databaseFilter, operation: operationFilter } = filterState;

    operations.forEach((operation, index) => {
        const database = DataDatabaseType[operation.databaseType];

        if (databaseFilter[database] && operationFilter[operation.operation]) {
            filteredOperations.push({
                ...operation,
                index: index + 1
            });
        }
    });

    return filteredOperations;
};

export const getFilteredByAllOperationsSelector = createSelector(
    getFiltersState,
    getOperations,
    getFilteredByAllOperations
);

export const getSelectedOperationId = (
    selectedContextId: string,
    selectedOperations: { [key: string]: string }
) => {
    const selectedOperationId = selectedOperations[selectedContextId];

    return selectedOperationId;
};

export const getSelectedOperation = (operations: IDataOperation[], selectedOperationId: string) => {
    // TODO: Can this (need this) be optimized by building a map of id --> operation?
    return operations.find(
        operation => operation.eventId === selectedOperationId && operation.eventId !== undefined
    );
};

export const getSelectedOperationSelector = createSelector(
    getFilteredByAllOperationsSelector,
    getSelectedExchangeId,
    getSelectedOperation
);

/**
 * Return the minimum/maximum `offset` for the set of all service requests (i.e. exchanges).
 */
export const getTimelineEventsOffsetBoundary = createSelector(getOperations, exchanges => {
    const maxOffset = exchanges.reduce(
        (prev, exchange) =>
            exchange.duration ? Math.max(prev, exchange.offset + exchange.duration) : prev,
        0.1
    );

    return {
        minOffset: 0,
        maxOffset
    };
});

/**
 * countMessagesByFactory - factory that creates a countMessagesBy[name] function
 *                          that counts (#) numbers on filters.
 */
const countMessagesByFactory = (name: 'database' | 'operation') => {
    const byEnum = name === 'database' ? DataDatabaseType : DataOperationType;
    const names = getNamesForEnum(byEnum);
    const propName = `${name}Type`;

    return messages => {
        const counts = {};

        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const filterName = byEnum[message[propName]];
            counts[filterName] = (counts[filterName] || 0) + 1;
        }

        const result = names.map(n => {
            return {
                name: n,
                count: counts[n] || 0,
                [name]: byEnum[n]
            };
        });

        return result;
    };
};

const countMessagesByOperation = countMessagesByFactory('operation');
const countMessagesByDatabase = countMessagesByFactory('database');

/**
 * getOperationFiltersSummaries - selector that returns `operation filters` data(array).
 */
export const getOperationFiltersSummaries = createSelector(
    createSelector(getFilteredByDatabaseOperationsSelector, countMessagesByOperation),
    getOperationFiltersState,
    (operationCounts, operationFilters) => {
        return operationCounts.map(entry => {
            return {
                ...entry,
                isShown: operationFilters[entry.name]
            };
        });
    }
);

/**
 * getDatabaseFiltersSummaries - selector that  returns `operation filters` data(array).
 */
export const getDatabaseFiltersSummaries = createSelector(
    createSelector(getOperations, countMessagesByDatabase),
    getDatabaseFiltersState,
    (databaseCounts, databaseFilters) => {
        return databaseCounts.map(entry => {
            return {
                ...entry,
                isShown: databaseFilters[entry.name]
            };
        });
    }
);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataSelectors.ts