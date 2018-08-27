import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { IStoreState } from 'client/IStoreState';

import styles from './UrlText.scss';
import commonStyles from './Common.scss';
import { Icon } from './Icon';

export interface IUrlTextProps {
    alignHttpsIcon?: boolean;
    url: string;
    title?: string;
    displayUrl: string;
    showHttpsIcon: boolean;
    showHttpsText: boolean;
    suppressColor?: boolean;
}

export class UrlText extends React.PureComponent<IUrlTextProps & IConnectedUrlTextProps, {}> {
    public static defaultProps = {
        alignHttpsIcon: false,
        suppressColor: false
    } as IUrlTextProps;

    public render() {
        const {
            alignHttpsIcon,
            url,
            title,
            displayUrl,
            showHttpsIcon,
            showHttpsText,
            suppressColor
        } = this.props;

        const colorCssClass = !suppressColor ? styles.urlProtocolHttpsColor : '';

        const httpsIcon = showHttpsIcon
            ? <Icon shape="Lock" className={classNames(styles.urlProtocolHttps, colorCssClass)} />
            : alignHttpsIcon
              ? <Icon shape={undefined} className={styles.urlProtocolHttps} />
              : undefined;

        const httpsText = showHttpsText
            ? <span className={classNames(styles.urlProtocolHttps, colorCssClass)}>
                  {'https://'}
              </span>
            : undefined;

        return (
            <div className={classNames(styles.url, commonStyles.trimText)} title={title || url}>
                {httpsIcon}{httpsText}{displayUrl}
            </div>
        );
    }
}

export interface IConnectedUrlTextProps {
    alignHttpsIcon?: boolean;
    url: string;
    protocol: string;
    title?: string;
    origin?: string;
    suppressColor?: boolean;
}

export function mapStateToProps(
    state: IStoreState,
    ownProps: IConnectedUrlTextProps
): IUrlTextProps {
    const clientOrigin = ownProps.origin || window.location.origin;

    const protocol = ownProps.protocol;
    let url = ownProps.url;
    if (url.substr(0, clientOrigin.length) === clientOrigin) {
        url = url.substr(clientOrigin.length, url.length);
    }

    let showHttpsIcon = false;
    let showHttpsText = false;
    if (protocol.toLowerCase() === 'https') {
        if (url.substr(0, 5).toLowerCase() === 'https') {
            showHttpsText = true;
            url = url.substr(8, url.length);
        }
        showHttpsIcon = true;
    }

    if (url === '') {
        url = '/';
    }

    return {
        alignHttpsIcon: ownProps.alignHttpsIcon,
        url: ownProps.url,
        suppressColor: ownProps.suppressColor,
        showHttpsIcon,
        showHttpsText,
        displayUrl: url
    };
}

export default connect(mapStateToProps)(UrlText) as React.ComponentClass<IConnectedUrlTextProps>;



// WEBPACK FOOTER //
// ./src/client/common/components/UrlText.tsx