import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Modal from 'react-modal';

import { IStoreState } from '@client/IStoreState';
import { getSelectedRequest } from '@routes/requests/details/RequestsDetailsSelector';
import { getSelectedThemeName } from '@shell/themes/ThemesSelectors';

import styles from './RequestResponseTabStripModal.scss';
import commonStyles from '@common/components/Common.scss';
import { Icon } from '@common/components/Icon';
import UrlText from '@common/components/UrlText';
import tabStripStyles from '@common/components/TabStrip.scss';

interface IRequestResponseTabStripModalProps {
    title: string;
    className?: string;
    modalClassName?: string;
    theme: string;
    url: string;
    protocol: string;
}

interface IRequestResponseTabStripModalState {
    modalIsOpen: boolean;
}

interface IRequestResponseTabStripModalModalProps extends ReactModal.Props {
    className?: string;
    title?: string;
    url?: string;
    protocol?: string;
    onRequestClose: () => void;
}

export class RequestResponseTabStripModalModal extends React.Component<
    IRequestResponseTabStripModalModalProps,
    {}
> {
    public render() {
        const {
            isOpen,
            onRequestClose,
            className,
            overlayClassName,
            contentLabel,
            title,
            url,
            protocol
        } = this.props;

        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={onRequestClose}
                className={classNames(commonStyles.modal, tabStripStyles.stripContainerModal, className)}
                overlayClassName={overlayClassName}
                contentLabel={contentLabel}>
                <div className={commonStyles.modalInner}>
                    <button onClick={onRequestClose} className={commonStyles.modalClose}>
                        <Icon shape="Close" className={commonStyles.modalCloseIcon} />
                    </button>
                    <div className={styles.titleHolder}>
                        <h3 className={styles.title}>{title}</h3>
                        {url &&
                            <div className={styles.titleUrlHolder}>
                                <UrlText url={url} protocol={protocol} />
                            </div>}
                    </div>
                    {this.props.children}
                </div>
            </Modal>
        );
    }
}

export class RequestResponseTabStripModal extends React.Component<
    IRequestResponseTabStripModalProps,
    IRequestResponseTabStripModalState
> {
    constructor(props) {
        super(props);

        this.state = { modalIsOpen: false };
    }

    private openModal = () => {
        this.setState({ modalIsOpen: true });
    };

    private closeModal = () => {
        this.setState({ modalIsOpen: false });
    };

    public render() {
        const { title, className, modalClassName, theme, url, protocol } = this.props;
        const { modalIsOpen } = this.state;

        return (
            <div className={className}>
                <button onClick={this.openModal}>
                    <Icon shape="FullScreenExpand" className={styles.expandIcon} /> Expand View
                </button>
                <RequestResponseTabStripModalModal
                    isOpen={modalIsOpen}
                    onRequestClose={this.closeModal}
                    className={classNames(commonStyles.modal, modalClassName)}
                    overlayClassName={classNames(theme, commonStyles.modalOverlay)}
                    contentLabel={title}
                    title={title}
                    url={url}
                    protocol={protocol}>
                    {this.props.children}
                </RequestResponseTabStripModalModal>
            </div>
        );
    }
}

export interface IConnectedRequestResponseTabStripModalProps {
    title: string;
    className?: string;
    modalClassName?: string;
}

function mapStateToProps(
    state: IStoreState,
    ownProps: IConnectedRequestResponseTabStripModalProps
): IRequestResponseTabStripModalProps {
    const { title, className, modalClassName } = ownProps;

    const selectedRequest = getSelectedRequest(state);
    const webRequest = selectedRequest.webRequest;

    return {
        title,
        className,
        modalClassName,
        theme: getSelectedThemeName(state),
        url: webRequest.url,
        protocol: webRequest.protocol.identifier
    };
}

export default connect(mapStateToProps)(RequestResponseTabStripModal) as React.ComponentClass<
    IConnectedRequestResponseTabStripModalProps
>;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/views/RequestResponseTabStripModal.tsx