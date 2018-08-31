import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { OctopusConnection } from '@common/components/Octopus';
import styles from './NotificationPanel.scss';

interface INotificationPanelProps {
    heartbeat: boolean;
}

interface INotificationPanelState {
    /**
     * Whether the notification is temporarily hidden by the user.
     */
    isCollapsed: boolean;

    /**
     * Whether the notification is completely removed from view.
     */
    isDismissed: boolean;
}

const NOTIFICATIONS = {
    DISCONNECTED: {
        heading: 'Oops.',
        subheading: 'Server disconnected',
        paragraph:
            'Check your network connection and try again. Your past requests will stay visible.'
    },
    CONNECTED: {
        heading: 'Wooh!',
        subheading: 'Server connected.',
        paragraph: "Let's pretend that didn't happen."
    }
};

const DISMISSAL_DURATION = 600; // 0.6s
const HEARTBEAT_INTERVAL = 3000;

class NotificationPanel extends React.Component<INotificationPanelProps, INotificationPanelState> {
    constructor() {
        super();

        this.state = {
            isCollapsed: true,
            isDismissed: false
        };
    }
    private handleCollapse(isCollapsed: boolean): void {
        const { heartbeat } = this.props;

        this.setState({
            isCollapsed,

            // If there is no heartbeat, do not dismiss (un-dismiss) the notification
            isDismissed: heartbeat ? this.state.isDismissed : false
        });

        if (heartbeat && isCollapsed) {
            // If user has dismissed notification,
            // remove it completely from view after it transitions (0.6s).
            window.setTimeout(
                () =>
                    this.setState({
                        isDismissed: true
                    }),
                DISMISSAL_DURATION
            );
        }
    }
    private toggleCollapse = (): void => {
        const { isCollapsed } = this.state;

        this.handleCollapse(!isCollapsed);
    };
    private collapse = (): void => {
        this.handleCollapse(true);
    };
    private expandIfDisconnected(): void {
        if (!this.props.heartbeat) {
            this.handleCollapse(false);
        }
    }
    public componentWillReceiveProps({ heartbeat }): void {
        if (!heartbeat && this.state.isCollapsed) {
            // Wait 3 seconds until expanding the disconnected notification.
            // If heartbeat is detected within 3 seconds, the notification will not expand.
            window.setTimeout(() => this.expandIfDisconnected(), HEARTBEAT_INTERVAL);
        }
    }
    public render() {
        const { heartbeat } = this.props;
        const { isCollapsed, isDismissed } = this.state;
        const notification = heartbeat ? NOTIFICATIONS.CONNECTED : NOTIFICATIONS.DISCONNECTED;

        if (isDismissed) {
            return null; /* tslint:disable-line:no-null-keyword */
        }

        return (
            <div
                className={classNames(styles.container, {
                    [styles.statusDisconnected]: !heartbeat,
                    [styles.statusConnected]: heartbeat,
                    [styles.containerCollapsed]: isCollapsed
                })}>
                <OctopusConnection
                    className={classNames(styles.octopus, {
                        [styles.octopusConnected]: heartbeat
                    })}
                    onClick={this.toggleCollapse}
                    connected={heartbeat}
                />
                <div className={styles.heading}>
                    {notification.heading}
                </div>
                <div className={styles.subheading}>
                    {notification.subheading}
                </div>
                <p className={styles.paragraph}>
                    {notification.paragraph}
                </p>
                <button
                    type="button"
                    className={styles.button}
                    onClick={this.collapse}
                    tabIndex={-1}>
                    Got it
                </button>
            </div>
        );
    }
}

const mapStateToProps = ({ session: { messages: { heartbeat } } }) => ({ heartbeat });

export default connect(mapStateToProps)(NotificationPanel);



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/NotificationPanel.tsx