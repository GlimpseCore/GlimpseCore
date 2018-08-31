// tslint:disable-next-line:no-unused-variable
import React from 'react';
import classNames from 'classnames';

import { AgentType } from '@routes/requests/details/timeline/TimelineInterfaces';
import Icon from './Icon';

import styles from './AgentTypeIcon.scss';

export type IconShapeType = string | undefined;

interface IIconType {
    shape: IconShapeType;
    colorClassName: string;
    title: string;
}

interface IAgentTypeIconProps {
    agentType?: AgentType;
    className?: string;
}

const iconsMap: { [key: string]: IIconType } = {
    [AgentType.Browser]: {
        shape: 'Client',
        colorClassName: styles.agentTypeBrowserIconPath,
        title: 'Browser'
    },
    [AgentType.Server]: {
        shape: 'Server',
        colorClassName: styles.agentTypeServerIconPath,
        title: 'Server'
    },
    [AgentType.Other]: {
        shape: undefined,
        colorClassName: '',
        title: ''
    }
};

// tslint:disable-next-line:variable-name
const AgentTypeIcon = (props: IAgentTypeIconProps) => {
    const { agentType, className } = props;
    const icon = iconsMap[agentType || AgentType.Other];

    return (
        <span title={icon.title}>
            <Icon
                shape={icon.shape}
                className={classNames(styles.agentTypeIcon, className, icon.colorClassName)}
            />
        </span>
    );
};

export default AgentTypeIcon;



// WEBPACK FOOTER //
// ./src/client/common/components/AgentTypeIcon.tsx