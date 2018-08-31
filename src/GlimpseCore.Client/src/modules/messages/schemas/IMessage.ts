export interface IMessage<T> {
    payload: T,
    context: {
        id: string;
    }
}