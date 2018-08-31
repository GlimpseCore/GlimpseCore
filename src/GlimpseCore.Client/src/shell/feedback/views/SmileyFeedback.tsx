// tslint:disable-next-line:no-unused-variable
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import telemetryClient from '@modules/telemetry/TelemetryClient';

import {
    closeSmileyFeedbackDialog,
    selectSmileyFeedbackDialog,
    setSmileyFeedbackDialogInputValue,
    setSmileyFeedbackDialogSubmited,
    resetSmileyFeedbackDialog
} from '@shell/feedback/SmileyFeedbackActions';
import { getSmileyFeedbackState } from '@shell/feedback/SmileyFeedbackSelectors';
import { ISmileyFeedbackState } from '@shell/feedback/ISmileyFeedbackState';
import { Icon } from '@common/components/Icon';
import { OctopusFeedback, OctopusFeedbackTentacles } from '@common/components/Octopus';

import styles from './SmileyFeedback.scss';
import commonStyles from '@common/components/Common.scss';

export interface ISmileyFeedbackProps {
    dispatch: () => void;
}

export interface ISmileyFeedbackCallbacks {
    onInputChange: (e) => void;
    onSubmit: (
        props: ISmileyFeedbackState & ISmileyFeedbackProps & ISmileyFeedbackCallbacks
    ) => (e) => boolean;
    closeDialog: (boolean) => () => void;
    selectSmiley: (string) => () => void;
    onClose: () => void;
}

/**
 * Function to check if a string length is greater than threshold.
 *
 * @param {String} String to check.
 * @returns {Boolean} If string is longer than threshold.
 */
const isTextValid = (text: string): boolean => {
    const MIN_TEXT_LENGTH = 0;
    return text.length >= MIN_TEXT_LENGTH;
};

// block show/hide transition duration
export const TRANSITION_DURATION = 200;

/**
 * Function factory that calls the `callback` if `keyUp` event has `Enter` key.
 *
 * @param {Function} Function to call.
 * @return {Function} Function that should be provided as event listener.
 */
const submitByEnter = (callback: (e) => boolean) => {
    return e => {
        if (e.key === 'Enter') {
            callback(e);
        }
    };
};

/**
 * Function to render left section `question block`.
 *
 * @param {Object} Properties.
 * @return {Object} VDOM tree.
 */
const renderQuestion = (
    props: ISmileyFeedbackState & ISmileyFeedbackProps & ISmileyFeedbackCallbacks
) => {
    const { selectSmiley, onSubmit, selectedSmiley, comments, email } = props;

    const smileyClassName1 = selectedSmiley === 'good' ? styles.isSelected : '';
    const smileyClassName2 = selectedSmiley === 'bad' ? styles.isSelected : '';

    return (
        <div>
            <label>How was your experience?</label>
            <div>
                <button
                    type="text"
                    title="good"
                    className={classNames(styles.smileyButton, smileyClassName1)}
                    onClick={selectSmiley('good')}>
                    <Icon shape="Smiley" className={styles.smileyIcon} />
                </button>
                <button
                    type="text"
                    title="bad"
                    className={classNames(styles.smileyButton, smileyClassName2)}
                    onClick={selectSmiley('bad')}>
                    <Icon shape="SmileySad" className={styles.smileyIcon} />
                </button>
            </div>

            <form>
                <label htmlFor="glimpse-smiley-feedback-text">Tell us why?</label>
                <textarea
                    onChange={props.onInputChange}
                    value={comments}
                    id="glimpse-smiley-feedback-text"
                />
                <label htmlFor="glimpse-smiley-feedback-email">
                    Include your email address? (optional)
                </label>
                <span title="By including your email address, we may contact you about your feedback if we have questions.">
                    <Icon className={styles.informationIcon} shape="Information" />
                </span>
                <input
                    type="text"
                    onChange={props.onInputChange}
                    value={email}
                    onKeyUp={submitByEnter(onSubmit(props))}
                    id="glimpse-smiley-feedback-email"
                />

                <button
                    type="submit"
                    onClick={onSubmit(props)}
                    disabled={!isTextValid(comments)}
                    className={classNames(styles.sendButton)}>
                    Submit
                </button>
            </form>
        </div>
    );
};

/**
 * Function to render left section `Thanks for your feedback` block.
 *
 * @param {Object} Properties.
 * @return {Object} VDOM tree.
 */
const renderSubmitted = (
    props: ISmileyFeedbackState & ISmileyFeedbackProps & ISmileyFeedbackCallbacks
) => {
    return <label className={styles.isThanks}>Thanks for your feedback!</label>;
};

/**
 * Function to render left the `SmileyFeedback` component.
 *
 * @param {Object} Properties.
 * @return {Object} VDOM tree.
 */
class SmileyFeedback extends React.Component<
    ISmileyFeedbackState & ISmileyFeedbackProps & ISmileyFeedbackCallbacks,
    {}
> {
    public componentWillUnmount() {
        // will reset the feedback form once completely unmounted
        this.props.onClose();
    }
    public render() {
        const { closeDialog, isSubmitted } = this.props;
        const leftSectionRender = isSubmitted ? renderSubmitted : renderQuestion;

        return (
            <div key="feedback" className={styles.smileyFeedback}>
                <OctopusFeedback className={styles.octopus} />
                <OctopusFeedbackTentacles
                    className={styles.octopusTentacles}
                    topTentacleClassName={styles.topTentacle}
                    bottomTentacleClassName={styles.bottomTentacle}
                />
                <div className={styles.header}>
                    Let us know your feedback
                    {' '}
                    <Icon
                        shape="Close"
                        className={styles.closeIcon}
                        onClick={closeDialog(isSubmitted)}
                    />
                </div>
                <div className={styles.rightColumn}>
                    <label>Other ways to contact us</label>
                    <div className={styles.linkSection}>
                        <a
                            className={commonStyles.link}
                            href="https://aka.ms/glimpse-submit-a-bug"
                            target="_blank">
                            Submit a bug
                        </a>
                    </div>
                    <div className={styles.linkSection}>
                        <a
                            className={commonStyles.link}
                            href="https://aka.ms/glimpse-feature-request"
                            target="_blank">
                            Request a missing feature
                        </a>
                    </div>
                </div>
                <div className={styles.leftColumn}>
                    {leftSectionRender(this.props)}
                </div>
            </div>
        );
    }
}

/* tslint:disable:variable-name */
const SmileyFeedbackContainer = (
    props: ISmileyFeedbackState & ISmileyFeedbackProps & ISmileyFeedbackCallbacks
) => {
    const { isOpen } = props;

    return (
        <CSSTransitionGroup
            transitionName={{
                enter: styles.enter,
                leave: styles.leave
            }}
            transitionEnterTimeout={0}
            transitionLeaveTimeout={350}>
            {isOpen && <SmileyFeedback {...props} />}
        </CSSTransitionGroup>
    );
};

function mapDispatchToProps(dispatch): ISmileyFeedbackCallbacks {
    return {
        onClose: () => dispatch(resetSmileyFeedbackDialog()),
        closeDialog: (isSubmitted: boolean) => {
            return () => dispatch(closeSmileyFeedbackDialog());
        },
        selectSmiley: type => {
            return () => {
                dispatch(selectSmileyFeedbackDialog(type));
            };
        },
        onSubmit: (
            props: ISmileyFeedbackState & ISmileyFeedbackProps & ISmileyFeedbackCallbacks
        ) => {
            return e => {
                const { comments, selectedSmiley, email } = props;
                // user can submit the form by hitting `Enter` key,
                // so we need to check if the text is valid
                if (isTextValid(comments)) {
                    const data = { comments, selectedSmiley, email };
                    telemetryClient.sendEvent('Feedback', data, {});

                    dispatch(setSmileyFeedbackDialogSubmited());
                }
                e.preventDefault();
                return false;
            };
        },
        onInputChange: e => {
            const el = e.target;
            const payload = {
                name: el.tagName.toLowerCase(),
                text: el.value
            };

            dispatch(setSmileyFeedbackDialogInputValue(payload));
        }
    };
}

export default connect(state => getSmileyFeedbackState(state), mapDispatchToProps)(
    SmileyFeedbackContainer
);



// WEBPACK FOOTER //
// ./src/client/shell/feedback/views/SmileyFeedback.tsx