import { showRatingFeedbackDialog } from '@client/shell/rating-dialog/RatingDialogActions';
import { getSessionNumber } from '@client/shell/sessionNumber/SessionNumberSelectors';

export const triggerRatingDialog = (store) => {
    // get current session number
    const currentSessionNumber = getSessionNumber(store.getState());
    // on the 3rd session launch the Rating Feedback Dialog
    if (currentSessionNumber === 3) {
        store.dispatch(showRatingFeedbackDialog());
    }
};



// WEBPACK FOOTER //
// ./src/client/shell/rating-dialog/TriggerRatingDialog.ts