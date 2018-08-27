import { incrementSessionNumber } from './SessionNumberActions';

interface ISessionNumberState {
    number: number;
};

export const initialState: ISessionNumberState = {
    number: 0
};

export function sessionNumberReducer(state: ISessionNumberState = initialState, action) {
    switch (action.type) {
        case incrementSessionNumber.type:
            return {
                ...state,
                number: state.number + 1
            };

        default:
            return state;
    }
}



// WEBPACK FOOTER //
// ./src/client/shell/sessionNumber/SessionNumberReducer.ts