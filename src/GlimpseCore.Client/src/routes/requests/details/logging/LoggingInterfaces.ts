import * as Glimpse from '@_glimpse/glimpse-definitions';

import { AgentType } from '../timeline/TimelineInterfaces';

//
// STATE INTERFACES
//

export interface ILoggingPersistedState {
    filters: ILoggingFiltersPersistedState;
}

export interface ILoggingFiltersPersistedState {
    agent: ILoggingFilterValue;
    level: ILoggingFilterValue;
}

export interface ILoggingFilterValue {
    [key: number]: boolean;
}

export interface ILoggingExploredCategories {
    [key: string]: boolean;
}

export interface ILoggingSessionState {
    exploredCategories: ILoggingExploredCategories;
    selectedCategory: string;
}

//
// SELECTOR INTERFACES
//

export type ILoggingMessagePayloads = Glimpse.Messages.Payloads.Log.ICount &
    Glimpse.Messages.Payloads.Log.IGroupBegin &
    Glimpse.Messages.Payloads.Log.IWrite &
    Glimpse.Messages.Payloads.Mixin.ICorrelation;

export interface ILoggingMessage {
    contextId: string;
    messageId: string;
    index: number;
    ordinal: number;
    types: string[];
    offset: number;
    payload: ILoggingMessagePayloads;
    agent: AgentType;
    correlations?: {
        begin?: ILoggingMessage;
        end?: ILoggingMessage;
        isBegin?: boolean;
        isEnd?: boolean;
        isGroup?: boolean;
        ends?: ILoggingMessage[];
    };
    group?: {
        isActive: boolean;
        begin: ILoggingMessage;
        end: ILoggingMessage;
        isClosed: boolean;
        isEnding: boolean;
    }[];
    level: LoggingMessageLevel;
    isCollapsed?: boolean;
    isVisible?: boolean;
}

export interface ILoggingAgentCount {
    name: string;
    count: number;
    agent: AgentType;
}

export interface ILoggingLevelCount {
    name: string;
    count: number;
    level: LoggingMessageLevel;
}

export interface ILoggingLevelSummary extends ILoggingLevelCount {
    isShown: boolean;
}

export interface ILoggingAgentSummary extends ILoggingAgentCount {
    isShown: boolean;
}

export enum LoggingMessageLevel {
    Error,
    Warning,
    Info,
    Debug,
    Log
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/logging/LoggingInterfaces.ts