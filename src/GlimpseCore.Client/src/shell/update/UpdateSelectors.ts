import { IStoreState } from 'client/IStoreState';

export const getUpdateInfo = (state: IStoreState) => state.persisted.global.update;



// WEBPACK FOOTER //
// ./src/client/shell/update/UpdateSelectors.ts