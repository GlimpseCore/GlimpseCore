import * as Glimpse from '@_glimpse/glimpse-definitions';

import { IMessage } from '@modules/messages/schemas/IMessage';
import { ITimelineComponentSpan } from '@common/components/timeline/TimelineCommonInterfaces';
import { AgentType } from '../timeline/TimelineInterfaces';

export interface IExchangeModels {
    exchanges: IExchangeModel[];
    exchangesByCorrelationId: { [key: string]: IExchangeModel };
}

export enum StatusCodeClass {
    None,
    Informational, // 1xx status codes
    Success, // 2xx status codes
    Redirection, // 3xx status codes
    ClientError, // 4xx status codes
    ServerError, // 5xx status codes
    Other
}

/**
 * A request/response message pair (i.e "exchange") for an HTTP request initiated by the client or server during a server request.
 */
export interface IExchangeModel extends ITimelineComponentSpan {
    /**
     * The type of agent that recorded the request.
     */
    agent: AgentType;

    /**
     * (Optional) The Glimpse context ID of the application request (if any) represented by this exchange.
     */
    linkedContextId?: string;

    /**
     * The category (i.e. class) of the response status.
     */
    statusCodeClass: StatusCodeClass;

    /**
     * (Optional) The request message for the exchange.
     */
    request?: IMessage<
        Glimpse.Messages.Payloads.Data.Http.IRequest & Glimpse.Messages.Payloads.Mixin.ICallStack
    >;

    /**
     * (Optional) The response message for the exchange.
     */
    response?: IMessage<Glimpse.Messages.Payloads.Data.Http.IResponse>;
}

// TODO: move this to common shared location and update timeline & logging selectors
export interface IFilterValue {
    [key: number]: boolean;
}

export interface IServiceFiltersPersistedState {
    /**
     * map AgentType value -> boolean value
     */
    agent: IFilterValue;

    /**
     * map TimelineEventCategory value -> boolean value
     */
    statusCode: IFilterValue;
}

export interface IServicePersistedState {
    filters: IServiceFiltersPersistedState;
}

/**
 * Represents the persisted, request-specific data for the service tab
 */
export interface IServicePersistedRequestState {
    /**
     * The ID of the selected exchange (if any)
     */
    selectedExchangeId?: string;
}

export interface IServiceStatusCodeClassCount {
    name: string;
    count: number;
    statusCode: StatusCodeClass;
}

export interface IServiceStatusCodeClassSummary extends IServiceStatusCodeClassCount {
    isShown: boolean;
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/service/ServiceInterfaces.ts