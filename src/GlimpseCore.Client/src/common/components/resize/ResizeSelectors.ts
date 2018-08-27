import { IStoreState } from '@client/IStoreState';

export const getResizePanelsState = (state: IStoreState) => state.persisted.global.resizePanels;



// WEBPACK FOOTER //
// ./src/client/common/components/resize/ResizeSelectors.ts