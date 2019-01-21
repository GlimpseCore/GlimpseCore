import React from 'react';
import { connect } from 'react-redux';

import { getSelectedThemeName } from '@shell/themes/ThemesSelectors';
import { selectTheme } from '@shell/themes/ThemesActions';
import { isExperimentalMode } from '@common/util/ConfigurationUtilities';

import shellStatusBarStyles from '@shell/views/ShellStatusBarView.scss';
import { Icon } from '@common/components/Icon';
import { IconShapeType } from '@common/components/AgentTypeIcon';
import { IStoreState } from '@client/IStoreState';
import { ThemeType } from '@shell/themes/IThemesState';
const darkTheme = require('@common/themes/dark.tcss')

interface IThemeBarComponentState {
    isTheming: boolean;
}

interface IThemeBarComponentProps {
    selectedThemeName: ThemeType;
}

interface IThemeBarComponentDispatchProps {
    onSelectTheme: (theme: string) => void;
}

interface IThemeBarComponentCombinedProps extends IThemeBarComponentProps, IThemeBarComponentDispatchProps {}

/**
 * Function to detect if CSS custom properties are supported.
 *
 * @returns {Boolean} If the custom properties supported.
 */
const isCSSVariablesSupport = (): boolean => {
    const opacity = '0.5';
    const el = document.createElement('div');

    document.body.appendChild(el);

    // Setup CSS properties.
    el.style.setProperty('--test-opacity', opacity);
    el.style.opacity = 'var(--test-opacity)';
    const isSupported = `${window.getComputedStyle(el).opacity}` === opacity;

    document.body.removeChild(el);

    return isSupported;
};

class ThemeBarComponent extends React.Component<
    IThemeBarComponentCombinedProps,
    IThemeBarComponentState
> {
    private themeStyle;
    // current theme styles name in the DOM
    private currentTheme: string;

    constructor(props) {
        super(props);

        this.state = {
            isTheming: isCSSVariablesSupport() && isExperimentalMode()
        };
    }

    public render() {
        if (this.state.isTheming === false) {
            this.ensureThemeApplied(ThemeType.dark);
            return null; /* tslint:disable-line:no-null-keyword */
        } else {
            return (
                <div className={shellStatusBarStyles.statusBarGroup}>
                    {this.renderButton('Light', 'light', 'SunO')}
                    {this.renderButton('Dark', 'dark', 'MoonO')}
                </div>
            );
        }
    }

    private renderButton(label: string, theme: string, iconShape: IconShapeType) {
        const { selectedThemeName, onSelectTheme } = this.props;
        const className = selectedThemeName === theme
            ? shellStatusBarStyles.statusBarButtonActive
            : shellStatusBarStyles.statusBarButton;

        this.ensureThemeApplied(ThemeType.dark); // TODO: use selectedThemeName instead of just dark

        return (
            <button
                aria-label={label}
                className={className}
                type="button"
                onClick={() => onSelectTheme(theme)}>
                <Icon shape={iconShape} className={shellStatusBarStyles.statusBarButtonIcon} />
            </button>
        );
    }

    /**
     * ensureThemeApplied - function to load the theme.
     *
     * @return {string} Selected theme name.
     */
    private ensureThemeApplied(selectedThemeName: ThemeType) {
        // if already applied just return
        if (this.currentTheme === selectedThemeName) {
            return;
        }

        //const selectedTheme = `common/themes/${selectedThemeName}.tcss`;
        //const theme = require(selectedTheme);

        this.themeStyle.innerText = darkTheme; // TODO: use theme
        // save the theme name that already has styles in the DOM
        this.currentTheme = selectedThemeName;
    }

    /**
     * componentDidMount lifecycle - needed to create a themes `stylesheet`
     */
    public componentWillMount(): void {
        const style = document.createElement('style');
        // WebKit fix
        style.appendChild(document.createTextNode(''));
        // append the `style` to the `head`
        document.head.appendChild(style);
        // save the reference
        this.themeStyle = style;
    }
}

function mapStateToProps(state: IStoreState): IThemeBarComponentProps {
    return {
        selectedThemeName: getSelectedThemeName(state)
    };
}

function mapDispatchToProps(dispatch): IThemeBarComponentDispatchProps {
    return {
        onSelectTheme: theme => {
            dispatch(selectTheme(theme));
        }
    };
}

/* tslint:disable-next-line:variable-name */
export const ThemeBar = connect(mapStateToProps, mapDispatchToProps)(ThemeBarComponent);



// WEBPACK FOOTER //
// ./src/client/shell/themes/views/ThemeBar.tsx