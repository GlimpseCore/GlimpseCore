// tslint:disable-next-line:no-unused-variable
import React from 'react';
import classNames from 'classnames';

import { DialogsType } from '../RatingDialogInterfaces';
import { getCurrentRatingColor } from '@shell/rating-dialog/views/rating-buttons/RatingButtons.tsx';

import styles from './RatingDialog.scss';

const MIN_TEXT_LENGTH = 1;

interface ITexts {
    [key: string]: string;
}

interface IRatingFeedbackDialogProps {
    text: string;
    email: string;
    type: DialogsType;
    rating: number;
};

interface IRatingFeedbackDialogCallbacks {
    onTextInputChange: (e) => void;
    onEmailInputChange: (e) => void;
    onSubmit: (e) => void;
    onBack: (e) => void;
};

/**
 * Function to check if a string length is greater than threshold.
 *
 * @param {String} String to check.
 * @returns {Boolean} If string is longer than threshold.
 */
const isTextValid = (text: string): boolean => {
    return (text.length >= MIN_TEXT_LENGTH);
};

const getDialogCaption = (dialog: DialogsType): string => {
    switch (dialog) {
        case DialogsType.RatingFeedbackOK:
            return 'Thanks for letting us know!';
        case DialogsType.RatingFeedbackBad:
            return 'Sorry you don’t feel able to recommend us!';
        default:
            return '';
    }
};

const getDialogDescription = (dialog: DialogsType): string => {
    switch (dialog) {
        case DialogsType.RatingFeedbackOK:
            return 'If we could do one thing to make you more likely to recommend us, what would it be?';
        case DialogsType.RatingFeedbackBad:
            return 'We’d love to know how we can improve what we’re doing. What was missing or disappointing in your experience?';
        default:
            return '';
    }
};

export class RatingFeedbackDialog extends React.Component<IRatingFeedbackDialogProps & IRatingFeedbackDialogCallbacks, {}> {
    private submitLinkEl: HTMLElement;
    private textareaLinkEl: HTMLElement;

    private saveSubmitLinkEl = (el: HTMLElement) => {
        this.submitLinkEl = el;
    }

    private saveTextareaRef = (el: HTMLElement) => {
        this.textareaLinkEl = el;
    }

    public componentDidMount() {
        this.textareaLinkEl.focus();
    }

    private privateSubmitByEnter = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            this.submitLinkEl.click();
        }
    }

    public render() {
        const { text, email, rating, onTextInputChange, onEmailInputChange, onSubmit, onBack, type } = this.props;

        const ratingBorderColor = getCurrentRatingColor(rating);

        return (
            <div className={styles.dialog}>
                <div className={styles.section}>
                    <div
                        className={styles.rating}
                        style={{ borderColor: ratingBorderColor }}>
                        {rating}
                    </div>
                    <label className={classNames(styles.label, styles.isBold, styles.isLeftGap)}>{getDialogCaption(type)}</label>
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>{getDialogDescription(type)}</label>
                    <textarea
                        onChange={onTextInputChange}
                        value={text}
                        ref={this.saveTextareaRef}
                        onKeyDown={this.privateSubmitByEnter} />
                </div>
                <div className={styles.section}>
                    <label className={styles.label}>Email:</label>
                    <input
                        value={email}
                        onChange={onEmailInputChange}
                        onKeyDown={this.privateSubmitByEnter} />
                </div>
                <div className={styles.section}>
                    <button
                        onClick={onSubmit}
                        ref={this.saveSubmitLinkEl}
                        className={classNames(styles.button, { [styles.isDisabled]: !isTextValid(text) })}>
                        Send
                    </button>

                    <button
                        onClick={onBack}
                        className={classNames(styles.button, styles.isBackButton)}>
                        Back
                    </button>
                </div>
            </div>
        );
    }
};



// WEBPACK FOOTER //
// ./src/client/shell/rating-dialog/views/RatingFeedbackDialog.tsx