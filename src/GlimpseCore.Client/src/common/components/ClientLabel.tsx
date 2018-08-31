import React from 'react';
import { parse } from 'platform';
import classNames from 'classnames';
import { IconShapeType } from './AgentTypeIcon';
import { Icon } from './Icon';
import styles from './ClientLabel.scss';
import commonStyles from './Common.scss';

interface IClientLabelProps {
    userAgent: string;
    showIconOnly?: boolean;
    className?: string;
}

const SAFARI_CFNETWORK_UA_TEST = /^Safari\/[0-9\.]* CFNetwork\/[0-9\.]* Darwin\//;

export class ClientLabel extends React.PureComponent<IClientLabelProps, {}> {
    public render() {
        const { userAgent, showIconOnly, className } = this.props;

        // Note: if the userAgent is falsey, it queries the browser it's in
        // for it's user agent. We don't want that so we force it to a non-existent
        // user agent. If the user agent cannot be parsed, the parsed object is
        // returned with all fields set to null.
        let browserName = parse(userAgent || '-').name;
        let browserIcon: IconShapeType;
        switch (browserName) {
            case 'Chrome':
                browserIcon = 'Chrome';
                break;
            case 'Firefox':
                browserIcon = 'Firefox';
                break;
            case 'Microsoft Edge':
                browserIcon = 'Edge';
                break;
            case 'IE':
                browserIcon = 'IE';
                break;
            case 'Safari':
                browserIcon = 'Safari';
                break;
            case 'Opera':
                browserIcon = 'Opera';
                break;
            default:
                // Safari _sometimes_ reports this strange alternate form of user
                // agent that platform doesn't understand, so we manually check
                // for it here.
                if (SAFARI_CFNETWORK_UA_TEST.test(userAgent)) {
                    browserIcon = 'Safari';
                    browserName = 'Safari';
                } else {
                    browserIcon = 'QuestionMark';
                }
                break;
        }

        let text, title;
        if (!browserName) {
            const displayUserAgent = userAgent || 'Unknown';
            text = !showIconOnly
                ? <span className={commonStyles.trimText}>{`${displayUserAgent}`}</span>
                : undefined;
            title = `User Agent: ${displayUserAgent}`;
        } else {
            text = !showIconOnly
                ? <span className={commonStyles.trimText}>{browserName}</span>
                : undefined;
            title = `Client: ${browserName}\nUser Agent: ${userAgent}`;
        }

        return (
            <span title={title} className={styles.clientLabelContainer}>
                <Icon
                    className={classNames(className, styles.clientLabelIcon)}
                    shape={browserIcon}
                />
                {text}
            </span>
        );
    }
}



// WEBPACK FOOTER //
// ./src/client/common/components/ClientLabel.tsx