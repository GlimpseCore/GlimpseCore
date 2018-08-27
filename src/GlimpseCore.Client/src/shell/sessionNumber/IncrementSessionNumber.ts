import { incrementSessionNumber as incrementSessionNumberAction } from '@client/shell/sessionNumber/SessionNumberActions';

export const incrementSessionNumber = (store) => {
    store.dispatch(incrementSessionNumberAction());
};



// WEBPACK FOOTER //
// ./src/client/shell/sessionNumber/IncrementSessionNumber.ts