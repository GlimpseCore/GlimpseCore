import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import ExpandCollapseButton from './ExpandCollapseButton';
import { IStoreState } from '@client/IStoreState';
import { getExpansionState, isExpanded } from './expansion/ExpansionSelectors';

import styles from './ExpandableText.scss';

export interface IExpandableTextProps {
    requestId: string;
    elementId: string[];
    text;
    expanded?: boolean;
}

interface IExpandableTextState {
    wrappable?: boolean;
}

class ExpandableTextView extends React.Component<IExpandableTextProps, IExpandableTextState> {
    public refs: {
        container;
        target;
    };

    constructor(props) {
        super(props);

        this.state = {
            wrappable: false
        };
    }

    public render() {
        const { elementId, requestId, text, expanded } = this.props;
        const { wrappable } = this.state;

        return (
            <div
                className={styles.expandableText}
                onMouseEnter={e => this.onMouseEnter()}
                onMouseLeave={e => this.onMouseLeave()}>
                <ExpandCollapseButton
                    elementId={elementId}
                    expanded={expanded}
                    requestId={requestId}
                    visible={wrappable}
                    title="Text"
                />
                <div className={styles.expandableText} ref="container">
                    <div
                        className={classNames({ [styles.expandableTextHidden]: !expanded })}
                        ref="target">
                        {text}
                    </div>
                </div>
            </div>
        );
    }

    private onMouseEnter() {
        const computedStyles = window.getComputedStyle(this.refs.target);
        const lineHeight = computedStyles.lineHeight;

        let lineHeightNumber = undefined;

        // NOTE: If line-height is set to 'normal', Chrome returns 'normal' while others return a computed px-value.
        //       If 'normal' is returned, we estimate the line-height based on font-size.

        if (lineHeight === 'normal') {
            const fontSize = computedStyles.fontSize;

            const pxIndex = fontSize.indexOf('px');

            if (pxIndex >= 0) {
                const fontSizeNumber = parseFloat(fontSize.substring(0, pxIndex));

                lineHeightNumber = fontSizeNumber * 1.2; // Most browsers 'normal' line-height is ~1.2.
            }
        } else {
            const pxIndex = lineHeight.indexOf('px');

            if (pxIndex >= 0) {
                lineHeightNumber = parseFloat(lineHeight.substring(0, pxIndex));
            }
        }

        if (lineHeightNumber !== undefined) {
            // NOTE: A control is "wrappable" if it exceeds 1.5x the line height (which means it's probably already wrapped)
            //       * or *
            //       there is less than 1px difference between the widths of the text and its container (which means it's probably clipped).
            const wrappable =
                this.refs.target.offsetHeight > lineHeightNumber * 1.5 ||
                this.refs.container.offsetWidth - this.refs.target.offsetWidth < 1;
            const { expanded } = this.props;

            if (wrappable || !expanded) {
                this.setState({
                    wrappable: true
                });
            }
        }
    }

    private onMouseLeave() {
        const { wrappable } = this.state;

        if (wrappable) {
            this.setState({
                wrappable: false
            });
        }
    }
}

function mapStateToProps(state: IStoreState, ownProps: IExpandableTextProps): IExpandableTextProps {
    const { elementId, requestId, text } = ownProps;

    return {
        elementId,
        requestId,
        text,
        expanded: isExpanded(getExpansionState(state), elementId, /* defaultValue: */ true)
    };
}

const ExpandableText = connect(mapStateToProps)(ExpandableTextView); // tslint:disable-line:variable-name

export default ExpandableText;



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/ExpandableText.tsx