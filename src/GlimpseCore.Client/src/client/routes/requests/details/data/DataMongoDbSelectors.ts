import * as Glimpse from '@glimpse/glimpse-definitions';

import keyBy from 'lodash/keyBy';
import { IContext } from 'routes/requests/RequestsInterfaces';
import {
    IDataOperation,
    DataDatabaseType,
    DataOperationType,
    DataOperationStatus
} from './DataInterfaces';
import { getMessageByType } from 'routes/requests/RequestsSelector';
import { IMessage } from 'modules/messages/schemas/IMessage';

interface ICorrelatedMongoDBReadMessages {
    startMessage: IMessage<Glimpse.Messages.Payloads.Data.Store.Mongodb.IReadStart>;
    endMessage: IMessage<Glimpse.Messages.Payloads.Data.Store.Mongodb.IReadEnd>;
}

export function createMongoDbInsertOperation(
    message: IMessage<Glimpse.Messages.Payloads.Data.Store.Mongodb.IInsert>,
    offsetFactor: number
): IDataOperation {
    return {
        index: message.ordinal,
        ordinal: message.ordinal,
        eventId: message.id,
        databaseName: message.payload.database,
        databaseType: DataDatabaseType.MongoDB,
        serverName: message.payload.connectionHost,
        connectionPort: message.payload.connectionPort,
        duration: message.payload.duration,
        operation: 'Create',
        operationType: DataOperationType.Create,
        method: message.payload.operation,
        recordCount: message.payload.count,
        offset: offsetFactor + message.offset,
        collection: message.payload.collection,
        options: message.payload.options,
        query: {},
        insertedIds: message.payload.insertedIds,
        docs: message.payload.docs,
        status: DataOperationStatus.OK,
        statusMessage: `${message.payload.count} records inserted`
    };
}

export function createMongoDbReadOperation(
    messages: ICorrelatedMongoDBReadMessages,
    offsetFactor: number
): IDataOperation {
    const recordCount = messages.endMessage ? messages.endMessage.payload.totalRecordsRead : '-';

    return {
        index: messages.startMessage.ordinal,
        ordinal: messages.startMessage.ordinal,
        eventId: messages.startMessage.id,
        databaseName: messages.startMessage.payload.database,
        databaseType: DataDatabaseType.MongoDB,
        serverName: messages.startMessage.payload.connectionHost,
        connectionPort: messages.startMessage.payload.connectionPort,
        duration: messages.startMessage.payload.duration,
        operation: 'Read',
        operationType: DataOperationType.Read,
        method: messages.startMessage.payload.operation,
        recordCount,
        offset: offsetFactor + messages.startMessage.offset,
        collection: messages.startMessage.payload.collection,
        options: messages.startMessage.payload.options,
        query: messages.startMessage.payload.query,
        status: DataOperationStatus.OK,
        statusMessage: messages.endMessage ? `${recordCount} records read` : ''
    };
}

export function createMongoDbUpdateOperation(
    message: IMessage<Glimpse.Messages.Payloads.Data.Store.Mongodb.IUpdate>,
    offsetFactor: number
): IDataOperation {
    const recordCount = message.payload.modifiedCount + message.payload.upsertedCount;
    return {
        index: message.ordinal,
        ordinal: message.ordinal,
        eventId: message.id,
        databaseName: message.payload.database,
        databaseType: DataDatabaseType.MongoDB,
        serverName: message.payload.connectionHost,
        connectionPort: message.payload.connectionPort,
        duration: message.payload.duration,
        operation: 'Update',
        operationType: DataOperationType.Update,
        method: message.payload.operation,
        recordCount,
        modifiedCount: message.payload.modifiedCount,
        upsertedCount: message.payload.upsertedCount,
        matchedCount: message.payload.matchedCount,
        offset: offsetFactor + message.offset,
        collection: message.payload.collection,
        options: message.payload.options,
        query: message.payload.query,
        updates: message.payload.updates,
        status: DataOperationStatus.OK,
        statusMessage: `${recordCount} records affected`
    };
}

export function createMongoDbDeleteOperation(
    message: IMessage<Glimpse.Messages.Payloads.Data.Store.Mongodb.IDelete>,
    offsetFactor: number
): IDataOperation {
    return {
        index: message.ordinal,
        ordinal: message.ordinal,
        eventId: message.id,
        databaseName: message.payload.database,
        databaseType: DataDatabaseType.MongoDB,
        serverName: message.payload.connectionHost,
        connectionPort: message.payload.connectionPort,
        duration: message.payload.duration,
        operation: 'Delete',
        operationType: DataOperationType.Delete,
        method: message.payload.operation,
        recordCount: message.payload.count,
        offset: offsetFactor + message.offset,
        collection: message.payload.collection,
        options: message.payload.options,
        query: message.payload.query,
        status: DataOperationStatus.OK,
        statusMessage: `${message.payload.count} records deleted`
    };
}

export function correlateMongoDbReadMessages(
    startMessages: IMessage<Glimpse.Messages.Payloads.Data.Store.Mongodb.IReadStart>[],
    endMessages: IMessage<Glimpse.Messages.Payloads.Data.Store.Mongodb.IReadEnd>[]
): ICorrelatedMongoDBReadMessages[] {
    const endMessagesByCorrelationId = keyBy(
        endMessages,
        endMessage => endMessage.payload.correlationId
    );
    const sortedStartMessages = startMessages.sort((a, b) => a.ordinal - b.ordinal);
    const result: ICorrelatedMongoDBReadMessages[] = [];

    for (let i = 0; i < sortedStartMessages.length; i++) {
        result.push({
            startMessage: sortedStartMessages[i],
            endMessage: endMessagesByCorrelationId[sortedStartMessages[i].payload.correlationId]
        });
    }

    return result;
}

export function getMongoDbReadOperations(
    request: IContext,
    offsetFactor: number
): IDataOperation[] {
    const startMessages = getMessageByType<Glimpse.Messages.Payloads.Data.Store.Mongodb.IReadStart>(
        request.byType,
        Glimpse.Messages.Payloads.Data.Store.Mongodb.ReadStartType
    );
    const endMessages = getMessageByType<Glimpse.Messages.Payloads.Data.Store.Mongodb.IReadEnd>(
        request.byType,
        Glimpse.Messages.Payloads.Data.Store.Mongodb.ReadEndType
    );
    const correlatedMessages = correlateMongoDbReadMessages(startMessages, endMessages);
    return correlatedMessages.map(msg => {
        return createMongoDbReadOperation(msg, offsetFactor);
    });
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataMongoDbSelectors.ts