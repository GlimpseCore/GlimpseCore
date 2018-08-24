import * as Glimpse from '@glimpse/glimpse-definitions';
import includes from 'lodash/includes';
import keyBy from 'lodash/keyBy';
import forEach from 'lodash/forEach';
import sortBy from 'lodash/sortBy';
import { createSelector } from 'reselect';

import { IMessage } from 'modules/messages/schemas/IMessage';
import { getServerOffsetFactor } from '../request/RequestSelectors';
import { getMessageByType } from 'routes/requests/RequestsSelector';
import { getSelectedContext } from '../RequestsDetailsSelector';
import {
    isGlimpseCookieName,
    parseResponseCookie
} from 'routes/requests/details/components/request-response-tab-strip/cookies/CookieUtils';
import { isGlimpseHeaderName } from 'routes/requests/details/components/request-response-tab-strip/headers/HeadersSelectors';

interface ICorrelatedMiddlewareMessages {
    startMessage: IMessage<
        Glimpse.Messages.Payloads.Middleware.IStart &
            Partial<Glimpse.Messages.Payloads.Mixin.ICallStack>
    >;
    endMessage: IMessage<Glimpse.Messages.Payloads.Middleware.IEnd>;
    offset: number;
}

interface INestedMiddlewareMessages extends ICorrelatedMiddlewareMessages {
    middleware: INestedMiddlewareMessages[];
}

/* tslint:disable-next-line:variable-name */
export const ResponseHeaderOperationType = 'responseHeader';

// NOTE: This is not currently spec'd, but we're plumbing it in for the future.
export interface IResponseHeaderOperation {
    name: string;
    op: 'set' | 'unset';
    type: 'responseHeader';
    values: string[];
}

export type IMiddlewareOperation =
    | Glimpse.Messages.Payloads.Middleware.End.Definitions.IOperation
    | IResponseHeaderOperation;

export interface IRequestDetailRequestMiddlewareState {
    id: string;
    operations: IMiddlewareOperation[];
    middleware: IRequestDetailRequestMiddlewareState[];
    name: string;
    packageName: string;
    offset: number;
    types: string[];
    callStack?: Glimpse.Messages.Payloads.Mixin.ICallStackFrame[];
}

/**
 * given a set of correlated middleware start/end messages, sorted by start message ordinal
 * break them into a tree that reflects middleware nesting.
 */
function nestMiddlewareMessages(
    middlewareMessages: ICorrelatedMiddlewareMessages[]
): INestedMiddlewareMessages[] {
    const messageStack = [
        {
            startMessage: undefined,
            endMessage: undefined,
            middleware: []
        }
    ];

    middlewareMessages.forEach(middlewareMsg => {
        // when current start message ordinal is < top of stack's end message ordinal, it implies
        // that the middleware is nested in the top of the stack.
        while (
            messageStack[messageStack.length - 1].endMessage &&
            middlewareMsg.startMessage.ordinal >
                messageStack[messageStack.length - 1].endMessage.ordinal
        ) {
            messageStack.pop();
        }

        const middleware = {
            startMessage: middlewareMsg.startMessage,
            endMessage: middlewareMsg.endMessage,
            offset: middlewareMsg.offset,
            middleware: []
        };

        messageStack[messageStack.length - 1].middleware.push(middleware);

        if (middleware.endMessage) {
            messageStack.push(middleware);
        }
    });

    return messageStack[0].middleware;
}

function createMiddlewareOperations(
    endMessage: IMessage<Glimpse.Messages.Payloads.Middleware.IEnd>
): IMiddlewareOperation[] {
    // NOTE: We ignore Express Router modifications as they're likely actually modifications made by route middleware, not the Router itself.
    if (endMessage && endMessage.payload.name !== 'router') {
        const operations: IMiddlewareOperation[] = endMessage.payload.operations
            ? endMessage.payload.operations.slice()
            : [];

        if (endMessage.payload.headers) {
            // Fold in the header changes until we refactor the schema/agent to do the same...
            const headerOperations = sortBy(
                endMessage.payload.headers.filter(header => !isGlimpseHeaderName(header.name)).map(
                    header =>
                        <IResponseHeaderOperation>{
                            type: 'responseHeader',
                            name: header.name,
                            op: header.op,
                            values: header.values.filter(
                                value =>
                                    header.name.toLowerCase() !== 'set-cookie' ||
                                    !isGlimpseCookieName(parseResponseCookie(value).name)
                            )
                        }
                ),
                header => header.name
            );

            operations.push(...headerOperations);
        }

        return operations;
    } else {
        return [];
    }
}

function createMiddlewareState(
    messages: INestedMiddlewareMessages
): IRequestDetailRequestMiddlewareState {
    return {
        id: messages.startMessage.payload.correlationId,
        operations: createMiddlewareOperations(messages.endMessage),
        middleware: messages.middleware.map(middlewareMessages =>
            createMiddlewareState(middlewareMessages)
        ),
        name: messages.startMessage.payload.displayName || messages.startMessage.payload.name,
        packageName: messages.startMessage.payload.packageName,
        offset: messages.offset,
        types: messages.startMessage.types,
        callStack: messages.startMessage.payload.frames
    };
}

/**
 * Selector that returns raw middleware start/end messages for the selected context
 */
export const getMiddlewareStartAndEndMessages = createSelector(
    getSelectedContext,
    selectedContext => {
        if (selectedContext) {
            const middlewareStartMessages = getMessageByType<
                Glimpse.Messages.Payloads.Middleware.IStart
            >(selectedContext.byType, Glimpse.Messages.Payloads.Middleware.StartType);
            const middlewareEndMessages = getMessageByType<
                Glimpse.Messages.Payloads.Middleware.IEnd
            >(selectedContext.byType, Glimpse.Messages.Payloads.Middleware.EndType);

            return { middlewareStartMessages, middlewareEndMessages };
        } else {
            return undefined;
        }
    }
);

/**
 * Selector that returns an array of paired/correlated start/end middleware messages
 */
export const getCorrelatedMiddlewareMessages = createSelector(
    getMiddlewareStartAndEndMessages,
    getServerOffsetFactor,
    (middlewareMessages, offsetFactor): ICorrelatedMiddlewareMessages[] => {
        if (middlewareMessages) {
            // given a set of start messages & a set of end messages, match up the start & end message based
            // on correlation ID, and return an array of the correlated message pairs.
            const endMessagesByCorrelationId = keyBy(
                middlewareMessages.middlewareEndMessages,
                endMessage => endMessage.payload.correlationId
            );
            const sortedStartMessages = middlewareMessages.middlewareStartMessages.sort(
                (a, b) => a.ordinal - b.ordinal
            );

            const pairedMessages: ICorrelatedMiddlewareMessages[] = [];
            sortedStartMessages.forEach(startMessage => {
                pairedMessages.push({
                    startMessage: startMessage,
                    endMessage: endMessagesByCorrelationId[startMessage.payload.correlationId],
                    offset: startMessage.offset + offsetFactor
                });
            });

            return pairedMessages;
        }

        return [];
    }
);

/**
 * Selector that returns a tree of middleware messages, where the tree indicates middleware nesting
 */
export const getNestedMiddlewareMessages = createSelector(
    getCorrelatedMiddlewareMessages,
    correlatedMessages => {
        if (correlatedMessages) {
            return nestMiddlewareMessages(correlatedMessages).map(messages =>
                createMiddlewareState(messages)
            );
        }
        return [];
    }
);

export interface IFlattenedMiddlewareOperation {
    /* Tne operation performed by middleware. */
    operation: IMiddlewareOperation;

    /* Whether this operation represents the "current" (or final) value for its type. */
    isCurrent: boolean;
}

export interface IFlattenedMiddleware {
    id: string;
    /* How "nested" this middleware was when executing (e.g. the number of ancestor middleware). */
    depth: number;
    name: string;
    packageName: string;
    operations: IFlattenedMiddlewareOperation[];
    offset: number;
    location?: Glimpse.Messages.Payloads.Mixin.ICallStackFrame;
}

interface IOperationTracker {
    trackOperation(operation: IMiddlewareOperation): IFlattenedMiddlewareOperation;
    completeTracking(): void;
}

function flattenMiddlewareRecursive(
    middleware: IRequestDetailRequestMiddlewareState[],
    middlewareArray: IFlattenedMiddleware[],
    operationTrackers: { [key: string]: IOperationTracker },
    depth: number
): void {
    // Project each sequential middleware into a "flattened" middleware object and add to the passed array...
    middleware.forEach(middlewareItem => {
        let firstBodyOperation: IMiddlewareOperation;
        let lastStatusCodeOperation: IMiddlewareOperation;

        const newMiddleware: IFlattenedMiddleware = {
            id: middlewareItem.id,
            depth: depth,
            name: middlewareItem.name,
            packageName: middlewareItem.packageName,
            operations: middlewareItem.operations
                .map(operation => {
                    if (
                        operation.type ===
                        Glimpse.Messages.Payloads.Middleware.End.Definitions
                            .ResponseStatusCodeOperationType
                    ) {
                        lastStatusCodeOperation = operation;
                    }

                    if (
                        operation.type ===
                            Glimpse.Messages.Payloads.Middleware.End.Definitions
                                .ResponseBodyOperationType &&
                        firstBodyOperation === undefined
                    ) {
                        firstBodyOperation = operation;
                    }

                    const tracker = operationTrackers[operation.type];

                    return tracker ? tracker.trackOperation(operation) : undefined;
                })
                // Filter out operations we don't recognize...
                .filter(operation => operation !== undefined)
                // Filter out all but the first body operation (node: relies on map/filter being eager)...
                .filter(
                    operation =>
                        operation.operation.type !==
                            Glimpse.Messages.Payloads.Middleware.End.Definitions
                                .ResponseBodyOperationType ||
                        operation.operation === firstBodyOperation
                )
                // Filter out all but the last response status code operation (note: relies on map/filter being eager)...
                .filter(
                    operation =>
                        operation.operation.type !==
                            Glimpse.Messages.Payloads.Middleware.End.Definitions
                                .ResponseStatusCodeOperationType ||
                        operation.operation === lastStatusCodeOperation
                ),
            offset: middlewareItem.offset
        };

        const callStack = middlewareItem.callStack;
        if (
            includes(middlewareItem.types, Glimpse.Messages.Payloads.Mixin.CallStackType) &&
            callStack &&
            callStack.length
        ) {
            newMiddleware.location = callStack[0];
        }

        middlewareArray.push(newMiddleware);

        // "Flatten" any nested middleware into the passed array, while noting the nested depth (1 greater than the current depth)...
        flattenMiddlewareRecursive(
            middlewareItem.middleware,
            middlewareArray,
            operationTrackers,
            depth + 1
        );
    });
}

function flattenMiddleware(
    middleware: IRequestDetailRequestMiddlewareState[]
): IFlattenedMiddleware[] {
    const middlewareArray = [];
    const currentHeaders: { [key: string]: IFlattenedMiddlewareOperation } = {};
    let currentStatusCode: IFlattenedMiddlewareOperation = undefined;

    // NOTE: Glimpse tracks several types of middleware operations (e.g. status code and header changes, etc.).
    //       Some of these operations represent things that can be "overwritten" by subsequent operations.
    //       Those operation types need to track which middleware has set the current value, but do so in different ways.
    //       "Trackers" specific to each operation type perform that tracking.

    const operationTrackers: { [key: string]: IOperationTracker } = {
        [Glimpse.Messages.Payloads.Middleware.End.Definitions.ResponseBodyOperationType]: {
            trackOperation: (operation: IMiddlewareOperation) => {
                // Response body operations are always "current".
                return { operation, isCurrent: true };
            },
            completeTracking: () => {
                // No-op.
            }
        },
        [ResponseHeaderOperationType]: {
            trackOperation: (operation: IMiddlewareOperation) => {
                const responseHeaderOperation = <IResponseHeaderOperation>operation;
                const flattenedOperation = { operation, isCurrent: false };

                // Track the last operation to set this particular header...
                currentHeaders[responseHeaderOperation.name] = responseHeaderOperation.op === 'set'
                    ? flattenedOperation
                    : undefined;

                return flattenedOperation;
            },
            completeTracking: () => {
                // For each header, mark the last operation to set it as the one with the current value...
                forEach(currentHeaders, (value, key) => {
                    if (value) {
                        value.isCurrent = true;
                    }
                });
            }
        },
        [Glimpse.Messages.Payloads.Middleware.End.Definitions.ResponseStatusCodeOperationType]: {
            trackOperation: (operation: IMiddlewareOperation) => {
                const flattenedOperation = { operation, isCurrent: false };

                // Track the last operation to set the status code...
                currentStatusCode = flattenedOperation;

                return flattenedOperation;
            },
            completeTracking: () => {
                // Mark the last operation to set it as the one with the current value...
                if (currentStatusCode) {
                    currentStatusCode.isCurrent = true;
                }
            }
        }
    };

    // "Flatten" any nested middleware into the passed array, while noting the nested depth (starting with 0)...
    flattenMiddlewareRecursive(middleware, middlewareArray, operationTrackers, 0);

    // With no more middleware to flatten, operation tracking is complete...
    forEach(operationTrackers, value => {
        value.completeTracking();
    });

    return middlewareArray;
}

export const getMiddleware = createSelector(getNestedMiddlewareMessages, middleware => {
    // NOTE: Middleware (even in Express) is not executed in a strictly linear manner, but can be nested.
    //       However, our UX is to display middleware in a flat, linear table. Hence, we must take our
    //       nested model and convert it to a linear one.
    return flattenMiddleware(middleware);
});



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/request/RequestMiddlewareSelectors.ts