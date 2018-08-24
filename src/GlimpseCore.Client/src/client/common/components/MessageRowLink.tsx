import React from 'react';
import { messageTargetId } from 'client/common/util/CommonUtilities';

export interface IMessageRowLinkProps {
    ordinal: number;
    title: string;
    className?: string;
}

/**
 * MessageRowLink and MessageRowTarget form a pair. MessageRowLink is used to
 * create an anchor that can be clicked on. Once clicked, the page will scroll
 * down to the table row indicated by MessageRowTarget. The two are "linked" when
 * they are passed the same ordinal. Scrolling is handled using URL fragments
 * and HTML element IDs.
 *
 * @class MessageRowLink
 */
export class MessageRowLink extends React.Component<IMessageRowLinkProps, {}> {
    public render() {
        const { ordinal, title, className, children } = this.props;
        return (
            <a
                href={`#${messageTargetId(ordinal)}`}
                aria-label={title}
                title={title}
                className={className}>
                {children}
            </a>
        );
    }
}

export default MessageRowLink;



// WEBPACK FOOTER //
// ./src/client/common/components/MessageRowLink.tsx