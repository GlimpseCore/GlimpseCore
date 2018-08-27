import React from 'react';
import classNames from 'classnames';

import styles from './InformationLabel.scss';
import Icon from './Icon';

export interface IInformationLabelProps {
    text: string;
    textClassName?: string;
    annotation?: string;
}

export class InformationLabel extends React.Component<IInformationLabelProps, {}> {
    public render() {
        const { text, textClassName } = this.props;

        let annotation = this.props.annotation || text;

        return (
            <div className={classNames(styles.message, textClassName)} title={annotation}>
                <Icon className={styles.messageIcon} shape="Information" />
                <span>{text}</span>
            </div>
        );
    }
}

export default InformationLabel;



// WEBPACK FOOTER //
// ./src/client/common/components/InformationLabel.tsx