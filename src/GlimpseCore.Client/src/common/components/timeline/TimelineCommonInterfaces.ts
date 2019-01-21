export interface ITimelineComponentSpan {
    offset: number;
    duration?: number;
    eventId: string;
    ordinal: any;
    requestId?: string;
    index?: number;
    name?: string;
    value?: any
}
export interface ITimelineComponentEvent {
    offset: number;
    eventId: string;
    ordinal: any;
}
