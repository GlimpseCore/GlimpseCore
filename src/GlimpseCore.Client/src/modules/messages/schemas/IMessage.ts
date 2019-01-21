export interface IMessage<T> {
    payload: T,
    context: {
        id: string;
    },
    id: string;
    agent: any;
    ordinal: any;
    offset: any;
    types: any;
}