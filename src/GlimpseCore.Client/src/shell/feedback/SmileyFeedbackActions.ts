import { createSimpleActionCreator, createActionCreator } from 'common/actions/ActionCreator';

export const toggleSmileyFeedbackDialog = createSimpleActionCreator('shell.feedback.toggle');
export const closeSmileyFeedbackDialog = createSimpleActionCreator('shell.feedback.close');
export const resetSmileyFeedbackDialog = createSimpleActionCreator('shell.feedback.reset');
export const setSmileyFeedbackDialogSubmited = createSimpleActionCreator('shell.feedback.submit');
export const selectSmileyFeedbackDialog = createActionCreator('shell.feedback.select');
export const setSmileyFeedbackDialogInputValue = createActionCreator('shell.feedback.email');



// WEBPACK FOOTER //
// ./src/client/shell/feedback/SmileyFeedbackActions.ts