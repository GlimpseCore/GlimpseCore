import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { IStoreState } from 'client/IStoreState';

import styles from 'routes/requests/details/components/request-response-tab-strip/views/RequestResponseTabStrip.scss';
import commonStyles from 'common/components/Common.scss';
import tabStripStyles from 'common/components/TabStrip.scss';
import TabStrip, { TabStripType } from 'common/components/TabStrip';
import RequestResponseTabStripModal from 'routes/requests/details/components/request-response-tab-strip/views/RequestResponseTabStripModal';

interface IRequestResponseTabStripProps {
    requestConfig;
    responseConfig;
    requestId: string;
    detailAxis: string;
    requestAxis?: string;
    responseAxis?: string;
    className?: string;
}

export class RequestResponseTabStrip extends React.Component<IRequestResponseTabStripProps, {}> {
    public render() {
        const {
            requestConfig,
            responseConfig,
            requestId,
            detailAxis,
            requestAxis,
            responseAxis,
            className
        } = this.props;
        const requestComponent = requestConfig.byPath[requestAxis].component;
        const responseComponent = responseConfig.byPath[responseAxis].component;

        const requestContent = (
            <TabStrip
                config={requestConfig.list}
                urlData={{ requestId, detailAxis, requestAxis, responseAxis }}
                children={React.createElement(requestComponent)}
                type={TabStripType.Tabs}
            />
        );
        const responseContent = (
            <TabStrip
                config={responseConfig.list}
                urlData={{ requestId, detailAxis, requestAxis, responseAxis }}
                children={React.createElement(responseComponent)}
                type={TabStripType.Tabs}
            />
        );

        return (
            <div className={classNames(styles.strip, className)}>
                <table
                    className={classNames(
                        styles.stripContainer,
                        tabStripStyles.stripContainerSection
                    )}>
                    <tbody>
                        <tr>
                            <td className={classNames(styles.stripItem, styles.stripItemLeft)}>
                                <h3 className={commonStyles.detailTitle}>Request</h3>
                                <RequestResponseTabStripModal
                                    title="Request"
                                    className={styles.stripItemModal}
                                    modalClassName={tabStripStyles.stripContainerModal}>
                                    {requestContent}
                                </RequestResponseTabStripModal>
                                {requestContent}
                            </td>
                            <td className={classNames(styles.stripItem, styles.stripItemRight)}>
                                <h3 className={commonStyles.detailTitle}>Response</h3>
                                <RequestResponseTabStripModal
                                    title="Response"
                                    className={styles.stripItemModal}
                                    modalClassName={tabStripStyles.stripContainerModal}>
                                    {responseContent}
                                </RequestResponseTabStripModal>
                                {responseContent}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

interface IConnectedRequestResponseTabStrip {
    requestConfig;
    responseConfig;
    detailAxis: string;
    requestAxis?: string;
    responseAxis?: string;
}

function mapStateToProps(
    state: IStoreState,
    ownProps: IConnectedRequestResponseTabStrip
): IRequestResponseTabStripProps {
    const { requestConfig, responseConfig, detailAxis, requestAxis, responseAxis } = ownProps;

    return {
        requestConfig,
        responseConfig,
        requestId: state.session.messages.selectedContextId,
        detailAxis,
        requestAxis,
        responseAxis
    };
}

export default connect(mapStateToProps)(RequestResponseTabStrip) as React.ComponentClass<
    IConnectedRequestResponseTabStrip
>;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/views/RequestResponseTabStrip.tsx