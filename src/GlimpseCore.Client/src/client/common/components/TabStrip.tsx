import React from 'react';
import classNames from 'classnames';

import styles from './TabStrip.scss';
import RouteButton from 'common/components/RouteButton';

export enum TabStripType {
    Plain,
    Tabs
}

export interface ITabStripLink {
    title: string | ((titleOptions?: {}) => string);
    getUrl: (urlData: {}) => string;
}

export interface ITabStripProps {
    titleOptions?: {};
    children?;
    className?: string;
    config: ITabStripLink[];
    urlData: {};
    type: TabStripType;
    titlesContainerClassName?: string;
    contentContainerClassName?: string;
}

export class TabStrip extends React.Component<ITabStripProps, {}> {
    private processStripType(type: TabStripType) {
        if (type === TabStripType.Plain) {
            return styles.stripPlain;
        } else if (type === TabStripType.Tabs) {
            return styles.stripTabs;
        }
    }

    public render() {
        const {
            config,
            urlData,
            children,
            type,
            titlesContainerClassName,
            contentContainerClassName,
            className
        } = this.props;

        return (
            <div className={classNames(styles.strip, className)}>
                <div
                    className={classNames(
                        styles.stripButtonHolder,
                        this.processStripType(type),
                        titlesContainerClassName
                    )}>
                    {config.map(item => {
                        const title = typeof item.title === 'function'
                            ? item.title(this.props.titleOptions)
                            : item.title;
                        return (
                            <RouteButton
                                key={title}
                                to={item.getUrl(urlData)}
                                activeClassName={styles.stripButtonActive}
                                className={styles.stripButton}>
                                {title}
                            </RouteButton>
                        );
                    })}
                </div>
                <div className={classNames(styles.stripDetail, contentContainerClassName)}>
                    {children && React.cloneElement(children)}
                </div>
            </div>
        );
    }
}

export default TabStrip;



// WEBPACK FOOTER //
// ./src/client/common/components/TabStrip.tsx