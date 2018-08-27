import { ITimelineComponentSpan } from 'common/components/timeline/TimelineCommonInterfaces';

/**
 * Represents the persisted, request-specific data for the data tab
 */
export interface IDataPersistedRequestState {
    // The ID of the selected exchange (if any)
    selectedExchangeId?: string;
}

export interface IDataFilterState {
    [key: string]: boolean;
}

export interface IDataFiltersState {
    [key: string]: IDataFilterState;
}

export interface IDataPersistedState {
    filters: IDataFiltersState;
    selectedOperations: { [key: string]: string };
    selectedTab: string;
}

export interface IDataOperation extends ITimelineComponentSpan {
    operation: string;
    method: string;
    recordCount: number | string;
    databaseName: string;
    databaseType: DataDatabaseType;
    operationType: DataOperationType;
    serverName: string;
    connectionPort: number | string;
    collection?: string;
    // string[] is needed for `redis`
    options: { [key: string]: string | number } | string[];
    insertedIds?: string[];
    // tslint:disable-next-line:no-any
    docs?: { [key: string]: any }[];
    // tslint:disable-next-line:no-any
    query: string | { [key: string]: any };
    // needed for `redis`
    result?;
    updates?: {};
    status: DataOperationStatus;
    statusMessage: string;
    modifiedCount?: number; // only used for mongodb update operations
    upsertedCount?: number; // only used for mongodb update operations
    matchedCount?: number; // only used for mongodb update operations
}

export interface ISelectedTabState {
    requestTab: string;
    responseTab: string;
}

export enum DataDatabaseType {
    MongoDB,
    Redis
}

export enum DataOperationType {
    Create,
    Read,
    Update,
    Delete,
    Other
}

export enum DataOperationStatus {
    OK,
    Warning,
    Error
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataInterfaces.ts