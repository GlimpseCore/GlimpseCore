import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './RouteButton.scss';
import { basename } from '@client/history';

export interface IRouteButtonComponentProps {
    /**
     * Child content for button.
     */
    children?;

    /**
     * What route should be pushed to the router.
     */
    to: string;

    /**
     * Class that should be applied
     */
    className?: string;

    /**
     * Class that should be applied when button is active.
     */
    activeClassName?: string;

    /**
     * Whether the button is active and hence the activeClassName should
     * be applied.
     */
    isActive?: boolean;

    /**
     * Label that wuill be used as the title of the button
     */
    label?: string;

    /**
     * Callback which is executed onClick and overrides the default behaviour
     */
    onClick?: (props?: IRouteButtonComponentProps) => void;
}

export class RouteButton extends React.Component<IRouteButtonComponentProps, {}> {
    public static contextTypes: React.ValidationMap<{}> = {
        router: PropTypes.object.isRequired
    };

    public context: {
        router;
    };

    private onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const { onClick, to } = this.props;
        // if `command`/`ctrl` is not pressed,
        // redirect to `to` or pass it to the `onClick`
        // if the `command`/`ctrl` is pressed,
        // allow the native link redirect to the `href`
        const { metaKey, ctrlKey } = e.nativeEvent;

        if (!metaKey && !ctrlKey) {
            e.preventDefault();

            if (onClick) {
                onClick(this.props);
            } else {
                this.context.router.push(to);
            }
        }
    }

    private isActive = (): boolean => {
        const { router } = this.context;
        const { isActive } = this.props;

        // If the parent component knows whether the route is active, isActive will be `true` or `false`...
        if (isActive === undefined && process.env.NODE_ENV !== 'test') {
            const { to } = this.props;

            // `undefined` means that it doesn't know, so ask the router...
            // NOTE: Re-render is not guaranteed, so in certain component hierarchies the active
            //       state may not immediately change.
            return router.isActive(to);
        }

        return isActive || false;
    };

    public render() {
        const { label, className, activeClassName, to, children } = this.props;
        const routeClassName = classNames(className, styles.routeButton, this.isActive() && activeClassName);

        return (
            <a href={`${basename || ''}${to}`} onClick={this.onClick} className={routeClassName}  title={label}>
                {children}
            </a>
        );
    }
}

export default RouteButton;



// WEBPACK FOOTER //
// ./src/client/common/components/RouteButton.tsx