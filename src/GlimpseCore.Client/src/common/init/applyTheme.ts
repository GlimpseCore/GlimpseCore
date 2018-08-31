import { rootElement } from './getRootElement';
import { getSelectedThemeName } from '@shell/themes/ThemesSelectors';
import store from '@client/store';

/**
 * Function to get theme name from the store with a fallback.
 *
 * @param {Object} Store.
 * @returns {String} Theme name.
 */
const getThemeName = store => {
    let themeName;

    try {
        themeName = getSelectedThemeName(store.getState());
    } catch (e) {
        // fallback to default value
        themeName = 'dark';
    }

    return themeName;
};

export const applyTheme = () => {
    rootElement.className += ` ${getThemeName(store)}`;
};



// WEBPACK FOOTER //
// ./src/client/common/init/applyTheme.ts