import { ISmileyFeedbackState, Selected } from './ISmileyFeedbackState';
import {
    toggleSmileyFeedbackDialog,
    closeSmileyFeedbackDialog,
    resetSmileyFeedbackDialog,
    selectSmileyFeedbackDialog,
    setSmileyFeedbackDialogInputValue,
    setSmileyFeedbackDialogSubmited
} from './SmileyFeedbackActions';

export const initialState = {
    selectedSmiley: <Selected>'good',
    comments: '',
    email: '',
    isOpen: false,
    isSubmitted: false
};

export function smileyFeedbackReducer(state: ISmileyFeedbackState = initialState, action) {
    switch (action.type) {
        case toggleSmileyFeedbackDialog.type:
            return {
                ...state,
                isOpen: !state.isOpen
            };

        case closeSmileyFeedbackDialog.type:
            return {
                ...state,
                isOpen: false
            };

        case setSmileyFeedbackDialogInputValue.type:
            const { name, text } = action.payload;
            const type = name === 'input' ? 'email' : 'comments';

            return {
                ...state,
                [type]: text
            };

        case selectSmileyFeedbackDialog.type:
            return {
                ...state,
                selectedSmiley: action.payload
            };

        case resetSmileyFeedbackDialog.type:
            return {
                ...initialState
            };

        case setSmileyFeedbackDialogSubmited.type:
            return {
                ...state,
                isSubmitted: true
            };

        default:
            return state;
    }
}



// WEBPACK FOOTER //
// ./src/client/shell/feedback/SmileyFeedbackReducer.ts