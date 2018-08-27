import * as Glimpse from '@glimpse/glimpse-definitions';

import {
    ITimelineComponentEvent,
    ITimelineComponentSpan
} from 'common/components/timeline/TimelineCommonInterfaces';
import { IMessage } from 'modules/messages/schemas/IMessage';

export enum AgentType {
    Other,
    Server,
    Browser
}

export enum TimelineEventCategory {
    Logs,
    Data,
    Request,
    WebService,
    Other
}

/**
 * An event that occurs on the timeline
 */
export interface ITimelineEvent extends ITimelineComponentEvent {
    /**
     * display title of this event.
     */
    title: string;

    /**
     * source indicating if this event occured on the server or the browser.
     */
    source: AgentType;

    /**
     * category of this event
     */
    category: TimelineEventCategory;

    /**
     * custom description text for category
     */
    customCategoryDescription?: string;

    /**
     * Raw messages used to construct this timeline event.
     */
    rawMessages: IMessage<{}>[];
}

/**
 * A span of time that occurs on the timeline.  i.e., an event with a duration.
 */
export interface ITimelineSpan extends ITimelineEvent, ITimelineComponentSpan {
    /**
     * offset value to use when sorting timeline spans vertically. This may be different from offset.
     */
    sortOffset: number;

    /**
     * call stack frames for an event.
     */
    frames?: Glimpse.Messages.Payloads.Mixin.ICallStackFrame[];
}

export interface ITimelineAgentCount {
    name: string;
    count: number;
    agent: AgentType;
}

export interface ITimelineAgentSummary extends ITimelineAgentCount {
    isShown: boolean;
}

export interface ISlowTimelineSpan extends ITimelineSpan {
    isVisible: boolean;
}

export interface ITimelineEvents {
    spans: ITimelineSpan[];
    pointInTimeEvents: ITimelineEvent[];
}

export interface IFilteredTimelineEvents extends ITimelineEvents {
    spansByDuration: ITimelineSpan[];
    eventIDsToSlowness: { [key: string]: number }; // map from event ID to number indicating how slow the event is.  1 indicates slowest span
}

export interface ISelectedTimelineEvents extends ITimelineEvents {
    eventIDsToSlowness: { [key: string]: number }; // map from event ID to number indicating how slow the event is.  1 indicates slowest span
    minOffset: number;
    maxOffset: number;
}

export interface ITimelineCategoryCount {
    name: string;
    count: number;
    category: TimelineEventCategory;
}

export interface ITimelineCategorySummary extends ITimelineCategoryCount {
    isShown: boolean;
}

export interface ITimelineFilterValue {
    [key: number]: boolean;
}

export interface ITimelineFiltersPersistedState {
    agent: ITimelineFilterValue; // // map AgentType value -> boolean value
    category: ITimelineFilterValue; // map TimelineEventCategory value -> boolean value
}

export interface ITimelinePersistedState {
    filters: ITimelineFiltersPersistedState;
}

export interface ITimelineOffsetsActionConfig {
    minOffset?: number;
    maxOffset?: number;
    segment?: string;
    requestId: string;
}

export interface ITimelineSelectedOffsetsState {
    minOffset?: number;
    maxOffset?: number;
    highlightedMinOffset?: number;
    highlightedMaxOffset?: number;
    segment?: string;
}

/**
 * Represents the persisted, request-specific data for the timeline tab
 */
export interface ITimelinePersistedRequestState {
    /**
     * The selected offsets (if any) for the timeline overview
     */
    selectedOffsets: ITimelineSelectedOffsetsState;
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/TimelineInterfaces.ts