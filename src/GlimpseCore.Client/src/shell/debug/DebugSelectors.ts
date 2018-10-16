import { IStoreState } from '@client/IStoreState';

export const getDebugEnabled = (state: IStoreState) => state.session.debug.enabled;



// WEBPACK FOOTER //
// ./src/client/shell/debug/DebugSelectors.ts