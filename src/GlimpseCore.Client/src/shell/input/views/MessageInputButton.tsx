import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Modal from 'react-modal';

import { IMessage } from '@modules/messages/schemas/IMessage';
import { IStoreState } from '@client/IStoreState';
import { fetchReceived } from '@modules/messages/MessagesActions';
import { getSelectedThemeName } from '@shell/themes/ThemesSelectors';

import commonStyles from '@common/components/Common.scss';
import shellStatusBarStyles from '@shell/views/ShellStatusBarView.scss';
import styles from './MessageInputButton.scss';
import { Icon } from '@common/components/Icon';

interface IDebugInputButtonProps {
    theme: string;
}

interface IDebugInputButtonCallbacks {
    onSendMessage: (input: string) => void;
}

interface IDebugInputButtonCombinedProps extends IDebugInputButtonProps, IDebugInputButtonCallbacks {}

interface IDebugInputButtonState {
    modalIsOpen?: boolean;
    value?: string;
}

export class DebugInputButton extends React.Component<
    IDebugInputButtonCombinedProps,
    IDebugInputButtonState
> {
    constructor(props) {
        super(props);

        this.state = { modalIsOpen: false, value: '' };
    }

    private openModal = () => {
        this.setState({ modalIsOpen: true });
    };

    private closeModal = () => {
        this.setState({ modalIsOpen: false });
    };

    private handleChange = e => {
        this.setState({ value: e.target.value });
    };

    private handleSubmit = e => {
        this.props.onSendMessage(this.state.value);
        e.preventDefault();
        this.closeModal();
    };

    public render() {
        const { theme } = this.props;
        const { modalIsOpen } = this.state;

        return (
            <button
                className={shellStatusBarStyles.statusBarButton}
                onClick={this.openModal}
                aria-label="Import Messages"
                type="button">
                <Icon shape="Import" className={shellStatusBarStyles.statusBarButtonIcon} />
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={this.closeModal}
                    className={commonStyles.modal}
                    overlayClassName={classNames(theme, commonStyles.modalOverlay)}
                    contentLabel="Import Messages">

                    <div className={commonStyles.modalInner}>
                        <button onClick={this.closeModal} className={commonStyles.modalClose}>
                            <Icon shape="Close" className={commonStyles.modalCloseIcon} />
                        </button>
                        <h3 className={commonStyles.detailTitle}>Upload Messages</h3>
                        <form onSubmit={this.handleSubmit}>
                            <label>
                                Messages:
                                <textarea
                                    className={styles.input}
                                    value={this.state.value}
                                    onChange={this.handleChange}
                                />
                            </label>
                            <input type="submit" value="Submit" />
                        </form>
                    </div>
                </Modal>
            </button>
        );
    }
}

function mapStateToProps(state: IStoreState): IDebugInputButtonProps {
    return {
        theme: getSelectedThemeName(state)
    };
}

function mapDispatchToProps(dispatch): IDebugInputButtonCallbacks {
    return {
        onSendMessage: (input: string) => {
            const messages = JSON.parse(input) as IMessage<{}>[];

            fetchReceived(dispatch, messages, 'manual');
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    DebugInputButton
) as React.ComponentClass<{}>;



// WEBPACK FOOTER //
// ./src/client/shell/input/views/MessageInputButton.tsx