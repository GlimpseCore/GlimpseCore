import React from 'react'; // tslint:disable-line:no-unused-variable
import classNames from 'classnames';
import styles from './MessageRowTarget.scss';
import commonStyles from '@common/components/Common.scss';
import { messageTargetId } from '@client/common/util/CommonUtilities';

export interface IMessageRowTarget {
    elementKey: string;
    ordinal: number;
    className?: string;
    children?;
    onClick?: (e) => boolean | undefined | void;
    onMouseEnter?: (e) => boolean | undefined | void;
    onMouseLeave?: (e) => boolean | undefined | void;
    isSelected?: boolean;
}

/**
 * MessageRowLink and MessageRowTarget form a pair. MessageRowLink is used to
 * create an anchor that can be clicked on. Once clicked, the page will scroll
 * down to the table row indicated by MessageRowTarget. The two are "linked" when
 * they are passed the same ordinal. Scrolling is handled using URL fragments
 * and HTML element IDs.
 *
 * @class MessageRowTarget
 */
// tslint:disable-next-line:variable-name
export class MessageRowTarget extends React.Component<IMessageRowTarget, {}> {
    private attachNode = (node: Element) => {
        const { isSelected } = this.props;

        if (node && isSelected && process.env.NODE_ENV !== 'test') {
            node.scrollIntoView();
        }
    };

    public render() {
        const {
            elementKey,
            ordinal,
            className,
            children,
            onClick,
            onMouseEnter,
            onMouseLeave
        } = this.props;

        return (
            <tr
                id={messageTargetId(ordinal)}
                key={elementKey}
                className={classNames(
                    styles.messageRowTargetContainer,
                    commonStyles.tableSelectableRow,
                    className
                )}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                ref={this.attachNode}>
                {children}
            </tr>
        );
    }
}

export default MessageRowTarget;



// WEBPACK FOOTER //
// ./src/client/common/components/MessageRowTarget.tsx