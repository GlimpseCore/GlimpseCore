import { THEMES_REQUESTED_THEME } from './ThemesConstants';

const initialState = {
    selectedTheme: 'dark'
};

/**
 * The reducer for the persisted, non-request-specific state related to the shell theme
 */
export function themesPersistedReducer(state = initialState, action) {
    if (action.type === THEMES_REQUESTED_THEME) {
        return {
            selectedTheme: action.theme
        };
    }
    return state;
}



// WEBPACK FOOTER //
// ./src/client/shell/themes/ThemesReducer.ts