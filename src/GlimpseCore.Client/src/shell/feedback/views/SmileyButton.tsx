// tslint:disable-next-line:no-unused-variable
import React from 'react';
import { connect } from 'react-redux';

import { Icon } from '@common/components/Icon';
import { IStoreState } from '@client/IStoreState';
import { ISmileyFeedbackState } from '@shell/feedback/ISmileyFeedbackState';
import { getSmileyFeedbackState } from '@shell/feedback/SmileyFeedbackSelectors';
import { toggleSmileyFeedbackDialog } from '@shell/feedback/SmileyFeedbackActions';

import shellStatusBarStyles from '@shell/views/ShellStatusBarView.scss';

interface ISmileyFeedbackCallbacks {
    openFeedbackDialog: (boolean) => () => void;
}

const smileyButton = (props: ISmileyFeedbackCallbacks & ISmileyFeedbackState) => {
    const { isOpen, isSubmitted, openFeedbackDialog } = props;
    const isReset = isOpen && isSubmitted;

    return (
        <button
            type="button"
            className={shellStatusBarStyles.statusBarButtonActive}
            onClick={openFeedbackDialog(isReset)}>
            <Icon shape="Smiley" className={shellStatusBarStyles.statusBarButtonIcon} />
        </button>
    );
};

function mapStateToProps(state: IStoreState): ISmileyFeedbackState {
    return getSmileyFeedbackState(state);
}

function mapDispatchToProps(dispatch): ISmileyFeedbackCallbacks {
    return {
        openFeedbackDialog: (isReset: boolean) => {
            return () => {
                dispatch(toggleSmileyFeedbackDialog());
            };
        }
    };
}

/* tslint:disable-next-line:variable-name */
export default connect(mapStateToProps, mapDispatchToProps)(smileyButton);



// WEBPACK FOOTER //
// ./src/client/shell/feedback/views/SmileyButton.tsx