import { THEMES_REQUESTED_THEME } from './ThemesConstants';

export function selectTheme(theme: string) {
    return {
        type: THEMES_REQUESTED_THEME,
        theme: theme
    };
}



// WEBPACK FOOTER //
// ./src/client/shell/themes/ThemesActions.ts