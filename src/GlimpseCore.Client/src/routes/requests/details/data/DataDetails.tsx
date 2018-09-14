import React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import styles from '@client/routes/requests/details/service/views/ServiceDetails.scss';
import DetailBiPanel from '@common/components/DetailBiPanel';
import TabStrip, { TabStripType } from '@common/components/TabStrip';
import { IDataOperation, DataDatabaseType } from '@routes/requests/details/data/DataInterfaces';
import {
    mongoLeftSectionConfig,
    mongoRightSectionConfig
} from '@routes/requests/details/data/DataDetailsMongoDbTabStripConfig';
import {
    redisLeftSectionConfig,
    redisRightSectionConfig
} from '@routes/requests/details/data/DataDetailsRedisTabStripConfig';
import { Resize, toggleOpenState } from '@common/components/resize/Resize';
import {
    SIDEBAR_MIN_HEIGHT,
    SIDEBAR_NORMAL_HEIGHT,
    SIDEBAR_THRESHOLD,
    SIDEBAR_MAX_HEIGHT
} from '@client/routes/requests/details/service/ServiceConstants';

interface IDataDetailsProps {
    location;
    exchange: IDataOperation;
    params: {
        requestId: string;
    };
}

const DATA_DETAILS_RESIZER_ID = 'data-details-resizer';

/**
 * getConfigs - function to map `databaseName` to tab strip `configs`.
 */
const getConfigs = (database: DataDatabaseType) => {
    switch (database) {
        case DataDatabaseType.MongoDB:
            return {
                left: mongoLeftSectionConfig,
                right: mongoRightSectionConfig
            };
        case DataDatabaseType.Redis:
            return {
                left: redisLeftSectionConfig,
                right: redisRightSectionConfig
            };

        default:
            return {
                left: mongoLeftSectionConfig,
                right: mongoRightSectionConfig
            };
    }
};

interface IDataDetailsCallbacks {
    onOpenStateToggle: () => void;
    routeToDefault: (url: string) => void;
}

export class DataDetails extends React.Component<IDataDetailsProps & IDataDetailsCallbacks, {}> {
    public render() {
        const { location, exchange } = this.props;
        const { requestAxis, responseAxis } = location.query;
        const configs = getConfigs(exchange.databaseType);

        return (
            <Resize
                id={DATA_DETAILS_RESIZER_ID}
                direction="y"
                initialSize={SIDEBAR_NORMAL_HEIGHT}
                initialIsOpen={true}
                threshold={SIDEBAR_THRESHOLD}
                minSize={SIDEBAR_MIN_HEIGHT}
                maxSize={SIDEBAR_MAX_HEIGHT}
                className={styles.details}>
                <DetailBiPanel
                    onTitleClick={this.props.onOpenStateToggle}
                    leftDetailPanel={this.renderPanel(configs.left, requestAxis)(this.props)}
                    leftDetailPanelTitle="Operation"
                    rightDetailPanel={this.renderPanel(configs.right, responseAxis)(this.props)}
                    rightDetailPanelTitle="Result"
                />
            </Resize>
        ) as JSX.Element;
    }

    private renderPanel(config, axis: string) {
        const { exchange, location, params } = this.props;
        const { requestId } = params;
        const { requestAxis, responseAxis } = location.query;

        const component = config.getOperationRouteMap()[axis]
            ? config.getOperationRouteMap()[axis].component
            : config.default().component;

        return props => (
            <TabStrip
                titleOptions={{ dataOperation: exchange, axis }}
                config={config.getOperationRouteData()}
                children={React.createElement(component, { tabName: axis })}
                urlData={{ exchangeId: exchange.eventId, requestId, requestAxis, responseAxis }}
                type={TabStripType.Tabs}
                titlesContainerClassName={styles.detailTabTitles}
            />
        );
    }

    private ensureUrlAxis() {
        const { exchange, location, params } = this.props;
        const { requestId } = params;
        const { requestAxis, responseAxis } = location.query;
        const urlData = { exchangeId: exchange.eventId, requestId, requestAxis, responseAxis };
        const configs = getConfigs(exchange.databaseType);
        // get configs for left and right sections
        const leftConfig = configs.left.getOperationRouteMap()[requestAxis];
        const rightConfig = configs.right.getOperationRouteMap()[responseAxis];
        const leftDefaultConfig = configs.left.default();
        const rightDefaultConfig = configs.right.default();
        // if the left config is `undefined` - thus the `axis` in the URL is unknown
        // - redirect to the default `axis` by replacing the URL query param
        if (!leftConfig) {
            this.props.routeToDefault(leftDefaultConfig.getUrl({
                ...urlData,
                // if rightAxis is unknown, use the default instead
                responseAxis: (rightConfig) ? responseAxis : rightDefaultConfig.path
            }));
        // same for the right
        } else if (!rightConfig) {
            this.props.routeToDefault(rightDefaultConfig.getUrl(urlData));
        }
    }

    public componentDidMount() {
        this.ensureUrlAxis();
    }

    public componentDidUpdate() {
        this.ensureUrlAxis();
    }
}

function mapDispatchToProps(dispatch): IDataDetailsCallbacks {
    return {
        routeToDefault: url => {
            dispatch(replace(url));
        },
        onOpenStateToggle: () => {
            dispatch(toggleOpenState({ id: DATA_DETAILS_RESIZER_ID }));
        }
    };
}

export default connect(null, mapDispatchToProps)(DataDetails);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataDetails.tsx