import * as Glimpse from '@glimpse/glimpse-definitions';
import URL from 'url-parse';

import { DataStoreRedisStartType, DataStoreRedisEndType } from './DataRedisTypes';
import { getMessageByType } from 'routes/requests/RequestsSelector';
import { mapCommandToCrud, mapCommandToDataOperationType } from './RedisCommandToCrudMap';
import { IContext } from 'client/routes/requests/RequestsInterfaces';
import { isArray, isObject } from 'common/util/CommonUtilities';
import { IMessage } from 'modules/messages/schemas/IMessage';
import {
    IDataOperation,
    DataDatabaseType,
    DataOperationType,
    DataOperationStatus
} from './DataInterfaces';

export interface IDataRedisStartPayload extends Glimpse.Messages.Payloads.Mixin.ICorrelationBegin {}

export interface IDataRedisEndPayload extends Glimpse.Messages.Payloads.Mixin.ICorrelationEnd {
    access: string;
    command: string;
    commandArgs: string[];
    address: string;
    result;
    duration: number;
}

interface IUrlAttributes {
    hostname: string;
    port: string;
    pathname: string;
}

export const safelyParseUrl = (address: string = ''): IUrlAttributes => {
    // if `null` or `undefined`, set to empty string
    // tslint:disable-next-line:no-null-keyword
    if (address === null) {
        address = '';
    }
    // trim the string
    address = address.trim();
    // if protocol is not defined, set it explicitly
    // this is needed for the `URL` library
    if (!/^[a-zA-z]+\:\/\//.test(address)) {
        address = `http://${address}`;
    }
    // tslint:disable-next-line:no-any
    const connection = new (URL as any)(address);

    return {
        hostname: connection.hostname,
        port: connection.port,
        pathname: connection.pathname
    };
};

export const getStatusString = (message: IMessage<IDataRedisEndPayload>): string => {
    let status = '';
    const result = message.payload.result;

    if (Array.isArray(result)) {
        const postfix = result.length !== 1 ? `s` : '';
        status = `${result.length} record${postfix}`;
    } else if (isObject(result)) {
        status = '1 record';
    } else if (typeof result === 'number') {
        return '[number]';
    } else if (typeof result === 'string' && (result === 'OK' || result === 'QUEUED')) {
        status = result;
    } else if (typeof result === 'string') {
        status = '[string]';
        // tslint:disable-next-line:no-null-keyword
    } else if (result === undefined || result === null) {
        status = `[${result}]`;
    } else if (typeof result === 'boolean') {
        status = '[boolean]';
    }

    return status;
};

export function createRedisOperation(
    startMessage: IMessage<IDataRedisStartPayload>,
    endMessage: IMessage<IDataRedisEndPayload>,
    offsetFactor: number
): IDataOperation {
    const method = endMessage.payload.command;
    const { result, address } = endMessage.payload;

    const operationType = mapCommandToDataOperationType(method);
    const collection = operationType === DataOperationType.Other
        ? '-'
        : endMessage.payload.commandArgs[0];
    // tslint:disable-next-line:no-any
    const connection = safelyParseUrl(address);
    // result is type of `array` -> use `length`
    const recordCount = isArray(result)
        ? result.length
        : // `object` -> `1`, otherwise `undefined`
          isObject(result) ? 1 : undefined;

    return {
        result,
        method,
        recordCount,
        collection,
        operation: mapCommandToCrud(method),
        operationType,
        databaseName: connection.pathname,
        databaseType: DataDatabaseType.Redis,
        options: endMessage.payload.commandArgs,
        serverName: connection.hostname,
        connectionPort: connection.port,
        query: {},
        index: startMessage.ordinal,
        ordinal: startMessage.ordinal,
        duration: endMessage.payload.duration,
        eventId: startMessage.payload.correlationId,
        offset: offsetFactor + startMessage.offset,
        status: DataOperationStatus.OK,
        statusMessage: getStatusString(endMessage)
    };
}

export function createRedisOperations(request: IContext, offsetFactor: number): IDataOperation[] {
    const startMessages = getMessageByType<IDataRedisStartPayload>(
        request.byType,
        DataStoreRedisStartType
    ).sort((a, b) => a.ordinal - b.ordinal);

    const endMessages: { [key: string]: IMessage<IDataRedisEndPayload> } = getMessageByType<
        IDataRedisEndPayload
    >(request.byType, DataStoreRedisEndType).reduce((previous, endMessage) => {
        previous[endMessage.payload.correlationId] = endMessage;

        return previous;
    }, {});

    return startMessages
        .map(startMessage => ({
            startMessage,
            endMessage: endMessages[startMessage.payload.correlationId]
        }))
        .filter(correlatedMessages => correlatedMessages.endMessage)
        .map(correlatedMessages =>
            createRedisOperation(
                correlatedMessages.startMessage,
                correlatedMessages.endMessage,
                offsetFactor
            )
        );
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataRedisSelectors.ts