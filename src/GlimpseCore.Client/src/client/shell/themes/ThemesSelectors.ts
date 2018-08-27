import { IStoreState } from 'client/IStoreState';

export const getSelectedThemeName = (state: IStoreState) =>
    state.persisted.global.themes.selectedTheme;



// WEBPACK FOOTER //
// ./src/client/shell/themes/ThemesSelectors.ts