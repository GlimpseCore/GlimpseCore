
export const getSessionNumberState = state => state.persisted.global.sessionNumber;
export const getSessionNumber = state => getSessionNumberState(state).number;



// WEBPACK FOOTER //
// ./src/client/shell/sessionNumber/SessionNumberSelectors.ts