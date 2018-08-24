// tslint:disable-next-line:no-unused-variable
import React from 'react';
import classNames from 'classnames';

import { Icon } from 'common/components/Icon';
import { getCurrentRatingColor } from 'shell/rating-dialog/views/rating-buttons/RatingButtons.tsx';

import styles from './RatingDialog.scss';

const MIN_TEXT_LENGTH = 1;
const MAX_TEXT_LENGTH = 123;

interface ISocialShareDialogProps {
    text: string;
    rating: number;
};

interface ISocialShareDialogCallbacks {
    onInputChange?: (e) => void;
    onBack?: (e) => void;
    onTwitterSubmit: (e) => void;
    onSend: (e) => void;
};

/**
 * Function to check if a string length is greater than threshold.
 *
 * @param {String} String to check.
 * @returns {Boolean} If string is longer than threshold.
 */
const isTextValid = (text: string): boolean => {
    return (text.length >= MIN_TEXT_LENGTH) && (text.length <= MAX_TEXT_LENGTH);
};

const isSendTextValid = (text: string): boolean => {
    return text.length >= MIN_TEXT_LENGTH;
};

export class RatingSocialShareDialog extends React.Component<ISocialShareDialogProps & ISocialShareDialogCallbacks, {}> {
    private submitLinkEl: HTMLElement;
    private textareaLinkEl: HTMLElement;

    private saveTextareaRef = (el: HTMLElement) => {
        this.textareaLinkEl = el;
    }

    private saveSubmitLinkEl = (el: HTMLElement) => {
        this.submitLinkEl = el;
    }

    public componentDidMount() {
        this.textareaLinkEl.focus();
    }

    private privateSubmitByEnter = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            this.submitLinkEl.click();
        }
    }

    private onTwitterSubmit = (text: string) => {
        const { onTwitterSubmit } = this.props;

        return (e) => {
            if (isTextValid(text)) {
                if (typeof onTwitterSubmit === 'function') {
                    onTwitterSubmit(e);
                }
            } else {
                e.preventDefault();
                return false;
            }
        };
    }

    private onSend = (text: string) => {
        const { onSend } = this.props;

        return (e) => {
            if (isSendTextValid(text)) {
                if (typeof onSend === 'function') {
                    onSend(e);
                }
            } else {
                e.preventDefault();
                return false;
            }
        };
    }

    public render() {
        const { text, rating, onInputChange, onBack } = this.props;

        const ratingBorderColor = getCurrentRatingColor(rating);

        const counter = MAX_TEXT_LENGTH - text.length;
        return (
            <div className={styles.dialog}>
                <div className={styles.section}>
                    <div
                        className={styles.rating}
                        style={{ borderColor: ratingBorderColor }}>
                        {rating}
                    </div>
                    <label className={classNames(styles.label, styles.isBold, styles.isLeftGap)}> Thanks for your feedback! </label>
                </div>

                <div className={styles.section}>
                    <label className={styles.label}> Mind telling your friends (and us) the number one reason they should try Glimpse? </label>
                </div>

                <div className={styles.section}>
                    <textarea
                        onChange={onInputChange}
                        value={text}
                        ref={this.saveTextareaRef}
                        onKeyDown={this.privateSubmitByEnter}/>
                    <div className={classNames(styles.count, { [styles.isExeed]: counter < 0 })}>
                        { counter }
                    </div>
                </div>
                <div className={styles.section}>
                    <a
                        title={'Tweet and send to us'}
                        target="_blank"
                        href={`https://twitter.com/share?text=${text}&url=' '&via=projGlimpse`}
                        onClick={this.onTwitterSubmit(text)}
                        ref={this.saveSubmitLinkEl}
                        className={classNames(styles.button, { [styles.isDisabled]: !isTextValid(text) })}>
                        <Icon shape="Twitter" className={styles.submitIcon} /> Tweet
                    </a>

                    <button
                        title={'Send to us only'}
                        onClick={this.onSend(text)}
                        className={classNames(styles.button, styles.isGrayButton, { [styles.isDisabled]: !isSendTextValid(text) })}>
                        Just send
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
}



// WEBPACK FOOTER //
// ./src/client/shell/rating-dialog/views/RatingSocialShareDialog.tsx