import {
    showRatingFeedbackDialog,
    closeDialog,
    setEmail,
    setText,
    setRating,
    submitDialog,
    resetDialog
} from './RatingDialogActions';
import { DialogsType } from './RatingDialogInterfaces';

interface IDialogState {
    currentDialog: DialogsType;
    rating: number;
    email: string;
    text: string;
    isSubmitted: boolean;
};

export const initialState: IDialogState = {
    currentDialog: DialogsType.None,
    email: '',
    text: '',
    rating: undefined,
    isSubmitted: false
};

export function ratingDialogReducer(state: IDialogState = initialState, action) {
    switch (action.type) {
        case closeDialog.type:
            return {
                ...state,
                currentDialog: DialogsType.None
            };

        case showRatingFeedbackDialog.type:
            const dialog = (state.currentDialog === DialogsType.None)
                ? DialogsType.Rating
                : state.currentDialog;

            return {
                ...state,
                currentDialog: dialog
            };

        case resetDialog.type:
            return {
                ...initialState
            };

        case setText.type:
            return {
                ...state,
                text: setText.unwrap(action)
            };

        case setEmail.type:
            return {
                ...state,
                email: setEmail.unwrap(action)
            };

        case submitDialog.type:
            return {
                ...state,
                isSubmitted: true
            };

        case setRating.type:
            const rating = setRating.unwrap(action);
            if (rating >= 9 && rating <= 10) {
                return {
                    ...state,
                    rating,
                    currentDialog: DialogsType.SocialShare
                };
            }
            if (rating >= 7 && rating <= 8) {
                return {
                    ...state,
                    rating,
                    currentDialog: DialogsType.RatingFeedbackOK
                };
            }

            if (rating <= 6) {
                return {
                    ...state,
                    rating,
                    currentDialog: DialogsType.RatingFeedbackBad
                };
            }

            if (!rating) {
                return {
                    ...state,
                    rating,
                    currentDialog: DialogsType.Rating
                };
            }

            return state;

        default:
            return state;
    }
}



// WEBPACK FOOTER //
// ./src/client/shell/rating-dialog/RatingDialogReducer.ts