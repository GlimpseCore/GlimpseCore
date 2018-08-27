import { createSimpleActionCreator, createActionCreator } from 'common/actions/ActionCreator';

export const closeDialog = createSimpleActionCreator('dialog.close.dialog');
export const showRatingFeedbackDialog = createSimpleActionCreator('dialog.open.dialog');
export const resetDialog = createSimpleActionCreator('dialog.reset.dialog');
export const setText = createActionCreator<string>('dialog.set.text');
export const setEmail = createActionCreator<string>('dialog.set.email');
export const submitDialog = createSimpleActionCreator('dialog.submit.dialog');
export const setRating = createActionCreator<number>('dialog.set.rating');



// WEBPACK FOOTER //
// ./src/client/shell/rating-dialog/RatingDialogActions.ts