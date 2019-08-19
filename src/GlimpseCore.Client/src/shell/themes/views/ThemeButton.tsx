import * as React from 'react';
import { IconShapeType } from '@common/components/AgentTypeIcon';
import { Icon } from '@common/components/Icon';
//import { default as shellStatusBarStyles } from '@shell/views/ShellStatusBarView.scss';
//import '@shell/views/ShellStatusBarView.scss';
import shellStatusBarStyles from '@shell/views/ShellStatusBarView.scss';

import { ThemeType } from '../IThemesState';

interface IThemeButtonProps {
    iconShape: IconShapeType
    label: string,
    selectedThemeName: ThemeType,
    theme: string,
    onSelectTheme: (theme: string) => void;
}

export class ThemeButton extends React.Component<IThemeButtonProps, any> {
    private className: string;
    
    constructor(props: any) {
        super(props);
        
        //var values = shellStatusBarStyles['statusBarButtonActive'];
        this.className = this.props.selectedThemeName === this.props.theme? 
            shellStatusBarStyles.statusBarButtonActive : shellStatusBarStyles.statusBarButton;

        //this.ensureThemeApplied(ThemeType.dark); // TODO: use selectedThemeName instead of just dark

    }

    public render() {
        return (
            <button
                aria-label={this.props.label}
                className={this.className}
                type="button"
                onClick={() => this.props.onSelectTheme(this.props.theme)}
                value="Calis">
                <Icon shape={this.props.iconShape} className={"statusBarButtonIcon"} />
            </button>
        );
    }
}