import sortBy from 'lodash/sortBy';
import React from 'react';
import { connect } from 'react-redux';

import { getSelectedContext } from '../RequestsDetailsSelector';
import { IContext } from '@routes/requests/RequestsInterfaces';
import { IMessage } from '@modules/messages/schemas/IMessage';
import { IMetadataState } from '@modules/metadata/IMetadataState';
import { IStoreState } from '@client/IStoreState';

import commonStyles from '@common/components/Common.scss';
import styles from './DebugView.scss';
import { CodeView } from '@routes/requests/components/CodeView';

export interface IDebugViewProps {
    metadata: IMetadataState;
    selectedContext: IContext;
}

export class DebugView extends React.Component<IDebugViewProps, {}> {
    public render() {
        const { selectedContext, metadata } = this.props;

        return (
            <div className={styles.view}>
                <h3 className={commonStyles.detailTitle}>Metadata</h3>
                <div className={styles.codeBlock}>
                    <CodeView
                        language="json"
                        code={this.prettyPrintJson(metadata)}
                        elementId={['debug', 'metadata']}
                        requestId={selectedContext.id}
                    />
                </div>
                <h3 className={commonStyles.detailTitle}>
                    {selectedContext.listing.length} Entries
                </h3>
                <table className={commonStyles.table}>
                    <thead>
                        <tr>
                            <th width="50">Ordinal</th>
                            <th width="10%">Type</th>
                            <th width="80">ID</th>
                            <th width="50%">Payload</th>
                        </tr>
                        <tr><td colSpan={4} className={commonStyles.tableHeadSpacer} /></tr>
                    </thead>
                    <tbody className={styles.messagesBody}>
                        {sortBy(selectedContext.listing, message => message.ordinal).map(message =>
                            this.renderMessage(message)
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    private renderMessage(message: IMessage<{}>) {
        const { selectedContext } = this.props;

        return (
            <tr key={message.id}>
                <td>{message.ordinal}</td>
                <td>{this.formatTypes(message.types)}</td>
                <td>{this.prettyPrintUuid(message.id)}</td>
                <td className={styles.payloadColumn}>
                    <CodeView
                        language="json"
                        code={this.prettyPrintJson(message.payload)}
                        elementId={['debug', 'messages', message.id]}
                        requestId={selectedContext.id}
                    />
                </td>
            </tr>
        );
    }

    private prettyPrintUuid(value: string): string {
        return value.slice(-12);
    }

    private prettyPrintJson(value): string {
        return JSON.stringify(value, undefined, 4);
    }

    private formatTypes(types) {
        return types.join(', ');
    }
}

function mapStateToProps(state: IStoreState): IDebugViewProps {
    return {
        metadata: state.session.metadata,
        selectedContext: getSelectedContext(state)
    };
}

export default connect(mapStateToProps)(DebugView);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/debug/DebugView.tsx