import {
    IResizePanelsState,
    IResizePersistedState,
    ISaveSizeAction,
    ISaveOpenAction,
    IToggleOpenAction
} from './ResizeInterfaces';
import { saveSize, saveOpenState, toggleOpenState } from './ResizeActions';
import { Action } from 'redux';

export const INITIAL_STATE: IResizePersistedState = {
    size: 200,
    isOpen: true
};

const peristSizeById = (
    state: IResizePanelsState,
    attributes: ISaveSizeAction
): IResizePanelsState => {
    const { id, size } = attributes;
    const newState = { ...state };

    newState[id] = {
        ...newState[id],
        size: size === undefined ? INITIAL_STATE.size : size
    };

    return newState;
};

const peristOpenStateById = (
    state: IResizePanelsState,
    attributes: ISaveOpenAction
): IResizePanelsState => {
    const newState = { ...state };
    const { id, isOpen } = attributes;

    newState[id] = {
        ...newState[id],
        isOpen: isOpen === undefined ? INITIAL_STATE.isOpen : isOpen
    };

    return newState;
};

const toggleOpenStateById = (
    state: IResizePanelsState,
    attributes: IToggleOpenAction
): IResizePanelsState => {
    const newState = { ...state };
    const { id } = attributes;

    newState[id] = {
        ...newState[id],
        isOpen: !newState[id].isOpen
    };

    return newState;
};

export const saveSizeReducer = (
    state: IResizePanelsState = {},
    action: Action
): IResizePanelsState => {
    switch (action.type) {
        case saveSize.type:
            return peristSizeById(state, saveSize.unwrap(action));
        case saveOpenState.type:
            return peristOpenStateById(state, saveOpenState.unwrap(action));
        case toggleOpenState.type:
            return toggleOpenStateById(state, toggleOpenState.unwrap(action));
        default:
            return state;
    }
};



// WEBPACK FOOTER //
// ./src/client/common/components/resize/ResizeReducers.ts