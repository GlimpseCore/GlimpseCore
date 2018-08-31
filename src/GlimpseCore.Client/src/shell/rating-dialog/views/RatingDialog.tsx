import React from 'react';
import ReactModal from 'react-modal';
import { connect } from 'react-redux';

import { RatingSocialShareDialog } from './RatingSocialShareDialog';
import { RatingScoreDialog } from './RatingScoreDialog';
import { RatingFeedbackDialog } from './RatingFeedbackDialog';
import { RatingThankYouDialog } from './RatingThankYouDialog';
import telemetryClient from '@modules/telemetry/TelemetryClient';
import { Icon } from '@common/components/Icon';
import { IStoreState } from '@client/IStoreState';
import { getDialogState } from '../RatingDialogSelectors';
import { DialogsType } from '../RatingDialogInterfaces';
import {
    closeDialog,
    resetDialog,
    setText,
    setEmail,
    setRating,
    submitDialog
} from '../RatingDialogActions';
import { OctopusFeedback, OctopusFeedbackTentacles } from '@common/components/Octopus';

import styles from './RatingDialog.scss';

interface IDialogProps {
    currentDialog: DialogsType;
    email: string;
    text: string;
    rating: number;
    isSubmitted: boolean;
}

interface IDialogCallbacks {
    onClose: (e) => void;
    onSubmit: () => void;
    onReset: () => void;
    onTextInputChange: (e) => void;
    onEmailInputChange: (e) => void;
    onBack: (e) => void;
    onRatingSet: (number) => void;
}

enum TelemetryCaseType {
    Dismissed,
    Submitted,
    Tweeted,
    Rated
}

const objToStringKeys = (obj) => {
    const newObj = {};
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        newObj[key] = `${obj[key]}`;
    };

    return newObj;
};

const sendTelemetry = (outcome: TelemetryCaseType, data: Partial<IDialogProps>) => {
    const sendData = {
        outcome: TelemetryCaseType[outcome],
        ...data
    };

    telemetryClient.sendEvent('Feedback_rating_dialog', objToStringKeys(sendData), {});
};

export class DialogComponent extends React.Component<IDialogProps & IDialogCallbacks, {}> {
    private onClose = (e) => {
        const { onClose, onReset, rating, text, email, isSubmitted } = this.props;

        if (!isSubmitted) {
            let outcome = (rating) ? TelemetryCaseType.Rated : TelemetryCaseType.Dismissed;
            sendTelemetry(outcome, { email, text, rating });
        }

        if (isSubmitted && rating) {
            onReset();
        }
        onClose(e);
    };

    private onSocialShareSubmitToTwitter = () => {
        const { rating, text, email, onSubmit } = this.props;

        sendTelemetry(TelemetryCaseType.Tweeted, { email, text, rating });
        onSubmit();
    }

    private onRatingFeedbackSubmit = () => {
        const { rating, text, email, onSubmit } = this.props;

        sendTelemetry(TelemetryCaseType.Submitted, { email, text, rating });
        onSubmit();
    }

    private renderCurrentDialog(currentDialog: DialogsType) {
        const { text, email, rating, isSubmitted, onBack, onTextInputChange, onEmailInputChange } = this.props;

        if (isSubmitted) {
            return (<RatingThankYouDialog />);
        }

        switch (currentDialog) {
            case DialogsType.SocialShare:
                return (
                <RatingSocialShareDialog
                    text={text}
                    onTwitterSubmit={this.onSocialShareSubmitToTwitter}
                    onSend={this.onRatingFeedbackSubmit}
                    onBack={onBack}
                    rating={rating}
                    onInputChange={onTextInputChange} />
                );

            case DialogsType.Rating:
                return (
                    <RatingScoreDialog onSelect={this.onRatingSubmit} />
                );
            case DialogsType.RatingFeedbackOK:
            case DialogsType.RatingFeedbackBad:
                return (
                    <RatingFeedbackDialog
                        text={text}
                        email={email}
                        type={currentDialog}
                        onTextInputChange={onTextInputChange}
                        onEmailInputChange={onEmailInputChange}
                        onBack={onBack}
                        rating={rating}
                        onSubmit={this.onRatingFeedbackSubmit} />
                );
            default:
                return undefined;
        }
    }

    private onRatingSubmit = (rating: number) => {
        this.props.onRatingSet(rating);
    }

    public render() {
        const { currentDialog } = this.props;

        return (
            <div>
                <ReactModal
                    contentLabel={''}
                    onRequestClose={this.onClose}
                    shouldCloseOnOverlayClick={true}
                    overlayClassName={styles.overlay}
                    className={styles.content}
                    isOpen={currentDialog !== DialogsType.None}>
                    <Icon shape="Close" className={styles.closeIcon} onClick={this.onClose} />
                    <span>
                        <OctopusFeedback className={styles.octopus} />
                        <OctopusFeedbackTentacles
                            className={styles.octopusTentacles}
                            topTentacleClassName={styles.topTentacle}
                            bottomTentacleClassName={styles.bottomTentacle} />
                    </span>
                    { this.renderCurrentDialog(currentDialog) }
                </ReactModal>
            </div>
        );
    }
};

function mapStateToProps(state: IStoreState, props): IDialogProps {
    return getDialogState(state);
}

function mapDispatchToProps(dispatch, props): IDialogCallbacks {
    return {
        onClose: (e) => {
            dispatch(closeDialog());
        },
        onSubmit: () => {
            dispatch(submitDialog());
        },
        onReset: () => {
            dispatch(resetDialog());
        },
        onTextInputChange: (e) => {
            dispatch(setText(e.target.value));
        },
        onEmailInputChange: (e) => {
            dispatch(setEmail(e.target.value));
        },
        onBack: (e) => {
            dispatch(setRating(undefined));
        },
        onRatingSet: (rating: number) => {
            dispatch(setRating(rating));
        }
    };
}

/* tslint:disable-next-line:variable-name */
export const Dialog = connect(mapStateToProps, mapDispatchToProps)(DialogComponent);



// WEBPACK FOOTER //
// ./src/client/shell/rating-dialog/views/RatingDialog.tsx