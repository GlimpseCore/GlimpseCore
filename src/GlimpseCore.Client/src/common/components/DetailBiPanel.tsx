import React from 'react';
import classNames from 'classnames';
import { RequestResponseTabStripModalModal } from '@routes/requests/details/components/request-response-tab-strip/views/RequestResponseTabStripModal';
import styles from './DetailBiPanel.scss';
import modalStyles from '@routes/requests/details/components/request-response-tab-strip/views/RequestResponseTabStripModal.scss';
import { Icon } from '@common/components/Icon';
import commonStyles from '@common/components/Common.scss';

export interface IDetailBiPanelProps {
    leftDetailPanel;
    leftDetailPanelTitle: string;
    rightDetailPanel;
    rightDetailPanelTitle: string;
}

export interface IDetailBiPanelState {
    openModal: 'left' | 'right' | false;
}

export interface IDetailBiPanelCallbacks {
    onTitleClick?: () => void;
}

class DetailBiPanel extends React.Component<
    IDetailBiPanelProps & IDetailBiPanelCallbacks,
    IDetailBiPanelState
> {
    constructor(props) {
        super(props);

        this.state = {
            openModal: false
        };
    }
    private setModal = (open: boolean) => (side?: 'left' | 'right') => (e?) => {
        if (e) {
            e.stopPropagation();
        }

        this.setState(state => ({
            ...state,
            openModal: open ? (side || false) : false
        }));
    };
    private openModal = this.setModal(true);
    private closeModal = this.setModal(false)();
    private openLeftModal = this.openModal('left');
    private openRightModal = this.openModal('right');
    public render() {
        const {
            onTitleClick,
            leftDetailPanelTitle,
            leftDetailPanel,
            rightDetailPanelTitle,
            rightDetailPanel
        } = this.props;
        const { openModal } = this.state;

        const className = classNames(styles.detail, {
            [styles.isClickableTitles]: !!onTitleClick
        });

        return (
            <div className={className}>
                <div className={styles.detailPanel}>
                    <div className={styles.detailPanelTitle} onClick={onTitleClick}>
                        {leftDetailPanelTitle}
                        <button className={styles.detailPanelExpandButton} onClick={this.openLeftModal}>
                            <Icon shape="FullScreenExpand" className={modalStyles.expandIcon} />{' '}
                            Expand View
                        </button>
                    </div>
                    <div className={styles.detailPanelContent}>{leftDetailPanel}</div>
                    <RequestResponseTabStripModalModal
                        isOpen={openModal === 'left'}
                        onRequestClose={this.closeModal}
                        overlayClassName={commonStyles.modalOverlay}
                        contentLabel={leftDetailPanelTitle}
                        title={leftDetailPanelTitle}>
                        {leftDetailPanel}
                    </RequestResponseTabStripModalModal>

                </div>
                <div className={styles.detailMargin} />
                <div className={styles.detailPanel}>
                    <div className={styles.detailPanelTitle} onClick={onTitleClick}>
                        {rightDetailPanelTitle}
                        <button className={styles.detailPanelExpandButton} onClick={this.openRightModal}>
                            <Icon shape="FullScreenExpand" className={modalStyles.expandIcon} />{' '}
                            Expand View
                        </button>
                    </div>
                    <div className={styles.detailPanelContent}>{rightDetailPanel}</div>
                    <RequestResponseTabStripModalModal
                        isOpen={openModal === 'right'}
                        onRequestClose={this.closeModal}
                        className={commonStyles.modal}
                        overlayClassName={commonStyles.modalOverlay}
                        contentLabel={rightDetailPanelTitle}
                        title={rightDetailPanelTitle}>
                        {rightDetailPanel}
                    </RequestResponseTabStripModalModal>
                </div>
            </div>
        );
    }
}

export default DetailBiPanel;



// WEBPACK FOOTER //
// ./src/client/common/components/DetailBiPanel.tsx