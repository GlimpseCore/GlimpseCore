import React from 'react';
import classNames from 'classnames';

import { LoggingMessageLevel } from '../LoggingInterfaces';

import styles from './LoggingLevelIcon.scss';
import { Icon } from '@common/components/Icon';

export interface ILevelIconProps {
    level: LoggingMessageLevel;
}

interface IIconLevel {
    shape: IconShapeType;
    colorClassName: string;
}

const iconsMap: { [key: string]: IIconLevel } = {
    [LoggingMessageLevel.Warning]: {
        shape: 'Warning',
        colorClassName: styles.isIconPathWarning
    },
    [LoggingMessageLevel.Error]: {
        shape: 'TimesCircle',
        colorClassName: styles.isIconPathError
    },
    [LoggingMessageLevel.Info]: {
        shape: 'InfoLogs',
        colorClassName: styles.isIconPathInfo
    }
};

export class LevelIcon extends React.Component<ILevelIconProps, {}> {
    public render() {
        const defaultIcon: IIconLevel = { shape: undefined, colorClassName: '' };
        const icon = iconsMap[this.props.level] || defaultIcon;

        return <Icon shape={icon.shape} className={classNames(styles.icon, icon.colorClassName)} />;
    }
}

export default LevelIcon;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/logging/views/LoggingLevelIcon.tsx