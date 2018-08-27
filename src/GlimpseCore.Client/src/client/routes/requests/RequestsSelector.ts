import * as Glimpse from '@glimpse/glimpse-definitions';
import { createSelector } from 'reselect';

import { classifyRequest } from 'common/util/ContentTypes';

import { IMessage } from 'modules/messages/schemas/IMessage';
import { IStoreState } from 'client/IStoreState';
import {
    IContext,
    IContextByType,
    IRequest,
    IMessagesLookup,
    IRequestsLookup
} from './RequestsInterfaces';

import { reportMalformedMessageError } from 'modules/errors/Errors';
import { timeStart, timeEnd } from 'common/util/Log';

const getMessagesLookup: (state: IStoreState) => IMessagesLookup = (() => {
    const initialResult: IMessagesLookup = {
        listing: [],
        byId: {},
        byContextId: {}
    };

    let lastStateMessages: IMessage<{}>[] = [];
    let lastStateVersion: number = 0;
    let lastResult: IMessagesLookup = initialResult;

    return (state: IStoreState): IMessagesLookup => {
        // if messages did not change - no need to derive new state, just
        // return the last calculated result immediately
        if (state.session.messages.listing === lastStateMessages) {
            return lastResult;
        }
        lastStateMessages = state.session.messages.listing;

        timeStart('[PERF] RequestsSelector.getMessagesLookup');

        // if version has changed then we need to reset the state
        if (lastStateVersion !== state.session.messages.version) {
            lastResult = { ...initialResult };
            lastStateVersion = state.session.messages.version;
        }

        let listing = lastResult.listing;
        let byId = lastResult.byId;
        let byContextId = lastResult.byContextId;

        // find out which messages we should be targetting. This is done
        // by looking at what messages we know about vs what which
        // messages we last knew about here.
        const clearedRequestsMap = state.session.messages.clearedRequestsMap;
        const newListing = state.session.messages.listing.filter(message => {
            const isCleared =
                message.context !== undefined && clearedRequestsMap[message.context.id];

            return byId[message.id] === undefined && !isCleared;
        });

        // only need to do something if there are any new messages
        if (newListing.length > 0) {
            let newById = {};
            let newByContextId = {};
            newListing.forEach((message: IMessage<{}>) => {
                if (message.context !== undefined && message.context.id !== undefined) {
                    const context = newByContextId[message.context.id] || {
                        id: message.context.id,
                        listing: [],
                        byType: {}
                    };
                    message.types.forEach(type => {
                        context.byType[type] = context.byType[type] || [];
                        context.byType[type].push(message);
                    });
                    context.listing.push(message);

                    newByContextId[message.context.id] = context;
                    newById[message.id] = message;
                } else {
                    const data = {
                        types: message.types ? message.types.join(',') : '',
                        agent: message.agent ? message.agent.source : ''
                    };

                    const error = new Error(
                        `RequestsSelector: no context found for message ID ${message.id}`
                    );
                    reportMalformedMessageError(error, data);
                }
            });

            for (let contextId in byContextId) {
                if (byContextId.hasOwnProperty(contextId)) {
                    const context = byContextId[contextId];
                    const newContext = newByContextId[contextId];
                    if (newContext) {
                        newContext.listing.push(...context.listing);

                        for (let byTypeKey in context.byType) {
                            if (context.byType.hasOwnProperty(byTypeKey)) {
                                const byType = context.byType[byTypeKey];
                                const newByType = newContext.byType[byTypeKey];
                                if (byType && newByType) {
                                    Array.prototype.push.apply(newByType, byType);
                                } else if (byType) {
                                    newContext.byType[byTypeKey] = byType;
                                }
                            }
                        }
                    } else {
                        newByContextId[contextId] = context;
                    }
                }
            }

            byContextId = newByContextId;
            byId = Object.assign(newById, lastResult.byId);
            newListing.push(...listing);
            listing = newListing;

            lastResult = {
                ...lastResult,
                listing,
                byId,
                byContextId
            };
        }

        timeEnd('[PERF] RequestsSelector.getMessagesLookup');

        return lastResult;
    };
})();

export const getRequestsLookup: (state: IStoreState) => IRequestsLookup = (() => {
    const initialResult: IRequestsLookup = {
        listing: [],
        byId: {}
    };

    let lastStateMessages: IMessage<{}>[] = [];
    let lastStateVersion: number = 0;
    let lastResult: IRequestsLookup = initialResult;

    function compareStartTime(a: IRequest, b: IRequest) {
        return a.requestStartStamp - b.requestStartStamp;
    }

    return (state: IStoreState): IRequestsLookup => {
        // if messages did not change - no need to derive new state, just
        // return the last calculated result immediately
        if (state.session.messages.listing === lastStateMessages) {
            return lastResult;
        }
        lastStateMessages = state.session.messages.listing;

        timeStart('[PERF] RequestsSelector.getRequestsLookup'); // tslint:disable-line:no-console

        // if version has changed then we need to reset the state
        if (lastStateVersion !== state.session.messages.version) {
            lastResult = { ...initialResult };
            lastStateVersion = state.session.messages.version;
        }

        let listing = lastResult.listing;
        let byId = lastResult.byId;

        // find out which requests we should be targetting. This is done
        // by looking at what message contexts we know about vs what which
        // contexts we last knew about here.
        const clearedRequestsMap = state.session.messages.clearedRequestsMap;
        const messages = getMessagesLookup(state);
        const newContextIds: string[] = [];
        for (const contextId in messages.byContextId) {
            if (contextId) {
                const isCleared = clearedRequestsMap[contextId];
                if (!isCleared && !byId[contextId]) {
                    newContextIds.push(contextId);
                }
            }
        }

        let newById: { [key: string]: IRequest } = { ...lastResult.byId };
        let newListing: IRequest[] = [...listing];

        let sortNeeded = false;
        let dataChanged = false;

        // need to make sure that the context object is updated for all existing requests
        // otherwise we wont get any updates that occure to the context object
        newListing.forEach((request: IRequest, i: number) => {
            const context = messages.byContextId[request.id];
            if (request.context !== context) {
                const newRequest = {
                    ...request,
                    context
                };

                // bring across new request
                newById[request.id] = newRequest;
                newListing[i] = newRequest;

                // we are forcing an update
                dataChanged = true;
            }
        });

        // try and find new requests in the new messages
        newContextIds.forEach((contextId: string) => {
            const context = messages.byContextId[contextId];

            // we only have the concept of a request once we have both messages
            const webRequest = getSingleMessageByType<Glimpse.Messages.Payloads.Web.IRequest>(
                context.byType,
                Glimpse.Messages.Payloads.Web.RequestType
            );
            const webResponse = getSingleMessageByType<Glimpse.Messages.Payloads.Web.IResponse>(
                context.byType,
                Glimpse.Messages.Payloads.Web.ResponseType
            );
            if (webRequest && webResponse) {
                const contentTypeClass = classifyRequest(webRequest, webResponse);
                const requestContext: IRequest = {
                    id: contextId,
                    webRequest: webRequest.payload,
                    webResponse: webResponse.payload,
                    context,
                    mediaType: contentTypeClass,
                    requestStartStamp: new Date(webRequest.payload.startTime).getTime()
                };

                sortNeeded =
                    sortNeeded ||
                    (newListing.length > 0 &&
                        requestContext.requestStartStamp <
                            newListing[newListing.length - 1].requestStartStamp);

                newListing.push(requestContext);

                newById[contextId] = requestContext;
            }
        });

        // only need to do something if one of the new messages let us "build" a new request
        if (newContextIds.length > 0) {
            // make sure we are sorting everything by start time
            if (sortNeeded) {
                newListing.sort(compareStartTime);
            }

            // we are forcing an update
            dataChanged = true;
        }

        // only change the result if needed... otherwise downstream systems will get false positives of changes
        if (dataChanged) {
            byId = newById;
            listing = newListing;

            lastResult = {
                listing,
                byId
            };
        }

        timeEnd('[PERF] RequestsSelector.getRequestsLookup'); // tslint:disable-line:no-console

        return lastResult;
    };
})();

export const getByContextId: (state: IStoreState) => { [key: string]: IContext } = createSelector(
    getMessagesLookup,
    requests => requests.byContextId
);

export const getSelectedContextId: (state: IStoreState) => string = state =>
    state.session.messages.selectedContextId;

export const getFollowMode = (state: IStoreState) => state.persisted.global.requests.followMode;

export const getFilterMode = (state: IStoreState) => state.persisted.global.requests.filterMode;

export function getSingleMessageByType<T>(byType: IContextByType, type: string): IMessage<T> {
    if (byType) {
        const messages = byType[type];

        if (messages && messages.length > 0) {
            return messages[0] as IMessage<T>;
        }
    }
}

export function getMessageByType<T>(byType: IContextByType, type: string): IMessage<T>[] {
    if (byType) {
        const messages: IMessage<T>[] = byType[type] as IMessage<T>[];
        if (messages) {
            return messages;
        }
    }
    return [];
}

const getPersistedRequestsState = (state: IStoreState) => state.persisted.requests;

/**
 * Gets the persisted state (if any) for the selected request
 */
export const getSelectedRequestPersistedState = createSelector(
    getSelectedContextId,
    getPersistedRequestsState,
    (selectedContextId, persistedRequestsState) => {
        const requestState = persistedRequestsState[selectedContextId];

        return requestState ? requestState.state : undefined;
    }
);



// WEBPACK FOOTER //
// ./src/client/routes/requests/RequestsSelector.ts