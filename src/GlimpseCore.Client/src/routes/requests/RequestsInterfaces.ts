export interface IContext {
    id: any;
    listing: any;
    byType: any;
}

export interface IRequestsLookup {
    listing: any[],
    byId: object
}

export interface IRequest {
    webRequest: any;
    context: any;
    webResponse: any;
    requestStartStamp: any;
    id: any;
    mediaType: any;
}

export interface IRequestPersistedState {}

export interface IContextByType {}

export interface IMessagesLookup {
    listing: any;
    byId: any;
    byContextId: any;
}