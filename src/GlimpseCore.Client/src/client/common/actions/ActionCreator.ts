import { Action } from 'redux';

interface IActionCreatorAction<TPayload> extends Action {
    payload: TPayload;
}

interface IActionCreatorBase {
    type: string;
}

interface IActionCreator<TPayload> extends IActionCreatorBase {
    (payload: TPayload): IActionCreatorAction<TPayload>;
    unwrap(action: Action): TPayload;
}

interface IRequestPersistedActionPayload {
    requestId: string;
}

interface IRequestPersistedActionCreator<
    TPayload extends IRequestPersistedActionPayload
> extends IActionCreator<TPayload> {}

interface ISimpleActionCreator extends IActionCreatorBase {
    (): Action;
}

/**
 * Creates a action creator for general purpose actions.
 *
 * @param type The unique ID of the actions to be created.
 */
export function createActionCreator<TPayload>(type: string): IActionCreator<TPayload> {
    const actionCreator = (payload: TPayload) => {
        return {
            type: type,
            payload: payload
        };
    };

    const typedActionCreator = <IActionCreator<TPayload>>actionCreator;

    typedActionCreator.type = type;
    typedActionCreator.unwrap = (action: Action) => {
        return (<IActionCreatorAction<TPayload>>action).payload;
    };

    return typedActionCreator;
}

/**
 * Creates an action creator for actions that manipulate request-specific persisted state.
 * This creator ensures that actions have the requisite payload properties for locating its state.
 *
 * @param type The unique ID of the actions to be created.
 */
export function createRequestPersistedActionCreator<
    TPayload extends IRequestPersistedActionPayload
>(type: string): IRequestPersistedActionCreator<TPayload> {
    return createActionCreator<TPayload>(type);
}

/**
 * Creates an action creator for "simple" actions that require no arguments (i.e. payload).
 *
 * @param type The unique ID of the actions to be created.
 */
export function createSimpleActionCreator(type: string): ISimpleActionCreator {
    const actionCreator = () => {
        return {
            type: type
        };
    };

    const typedActionCreator = <ISimpleActionCreator>actionCreator;

    typedActionCreator.type = type;

    return typedActionCreator;
}



// WEBPACK FOOTER //
// ./src/client/common/actions/ActionCreator.ts