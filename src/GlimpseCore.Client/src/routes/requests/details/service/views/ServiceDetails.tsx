import React from 'react';
import ReactRouter from 'react-router';
import { connect } from 'react-redux';

import styles from './ServiceDetails.scss';
import DetailBiPanel from '@common/components/DetailBiPanel';
import {
    requestConfig,
    responseConfig
} from '@routes/requests/details/service/views/ServiceTabStripConfig';
import { SERVICE_TAB_NAME } from '../ServiceConstants';
import TabStrip, { TabStripType } from '@common/components/TabStrip';
import { Resize, toggleOpenState } from '@common/components/resize/Resize';

import { IExchangeModel } from '../ServiceInterfaces';

import {
    SIDEBAR_MIN_HEIGHT,
    SIDEBAR_NORMAL_HEIGHT,
    SIDEBAR_THRESHOLD,
    SIDEBAR_MAX_HEIGHT,
    SERVICE_DETAILS_RESIZER_ID
} from '../ServiceConstants';

// TODO: detailAxis will probably go away... can probably derive it

interface IServiceDetailsViewProps extends ReactRouter.RouteComponentProps<{}, {}> {
    location;
    exchange: IExchangeModel;
    params: {
        requestId: string;
    };
}

interface IServiceDetailsViewCallbacks {
    onOpenStateToggle: () => void;
}

export class ServiceDetails extends React.Component<IServiceDetailsViewProps & IServiceDetailsViewCallbacks, {}> {
    public render() {
        return (
            <Resize
                id={SERVICE_DETAILS_RESIZER_ID}
                direction="y"
                initialSize={SIDEBAR_NORMAL_HEIGHT}
                initialIsOpen={true}
                threshold={SIDEBAR_THRESHOLD}
                minSize={SIDEBAR_MIN_HEIGHT}
                maxSize={SIDEBAR_MAX_HEIGHT}
                className={styles.details}>
                <DetailBiPanel
                    onTitleClick={this.props.onOpenStateToggle}
                    leftDetailPanel={this.renderLeftDetail()}
                    leftDetailPanelTitle="Request"
                    rightDetailPanel={this.renderRightDetail()}
                    rightDetailPanelTitle="Response"
                />
            </Resize>
        );
    }

    private renderLeftDetail() {
        return this.renderTabStrip(requestConfig, /* isRequest */ true);
    }

    private renderRightDetail() {
        return this.renderTabStrip(responseConfig, /* isRequest */ false);
    }

    private renderTabStrip(config, isRequest: boolean) {
        const { exchange, location, params } = this.props;

        const requestId = params.requestId;
        const detailAxis = `${SERVICE_TAB_NAME}/${exchange.eventId}`;
        const requestAxis = location.query.requestAxis;
        const responseAxis = location.query.responseAxis;
        const component = config.byPath[isRequest ? requestAxis : responseAxis].component;

        return (
            <TabStrip
                config={config.list}
                urlData={{ requestId, detailAxis, requestAxis, responseAxis }}
                children={React.createElement(component)}
                type={TabStripType.Tabs}
                titlesContainerClassName={styles.detailTabTitles}
                contentContainerClassName={styles.detailTabContent}
            />
        );
    }
}

function mapDispatchToProps(dispatch): IServiceDetailsViewCallbacks {
    return {
        onOpenStateToggle: () => {
            dispatch(toggleOpenState({ id: SERVICE_DETAILS_RESIZER_ID }));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(ServiceDetails);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/service/views/ServiceDetails.tsx