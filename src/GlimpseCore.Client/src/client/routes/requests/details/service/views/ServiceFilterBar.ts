import { connect } from 'react-redux';

import { getAgentFilterSummaries, getStatusCodeFilterSummaries } from '../ServiceSelectors';
import { IFilterBarProps, IFilterBarCallbacks, FilterBar } from 'common/components/FilterBar';
import { IStoreState } from 'client/IStoreState';
import loggingFilterBarStyles from 'routes/requests/details/logging/views/LoggingFilterBar.scss';
import { toggleStatusCodeClassAction, toggleAgentAction, resetAllAction } from '../ServiceActions';
import { AgentType } from 'routes/requests/details/timeline/TimelineInterfaces';
import { StatusCodeClass } from '../ServiceInterfaces';
import { getColorStyleForStatusCode, getIconForStatusCode } from './ServiceCommon';
import { getStatusCodeShortNames } from '../ServiceUtils';

import styles from './ServiceCommon.scss';

function addAgentDisplayProperties(filter) {
    switch (filter.agent) {
        case AgentType.Browser:
            return {
                displayName: 'Browser',
                icon: 'Client',
                iconPathClassName: loggingFilterBarStyles.agentBrowserIcon,
                ...filter
            };

        case AgentType.Server:
            return {
                displayName: 'Server',
                icon: 'Server',
                iconPathClassName: loggingFilterBarStyles.agentServerIcon,
                ...filter
            };

        default:
            return filter;
    }
}

function addStatusCodeDisplayProperties(filter) {
    return Object.assign(
        {},
        {
            displayName: getStatusCodeShortNames(filter.statusCode),
            icon: getIconForStatusCode(filter.statusCode),
            iconClassName: styles.statusCodeIcon,
            iconPathClassName: getColorStyleForStatusCode(filter.statusCode)
        },
        filter
    );
}

function mapStateToProps(state: IStoreState): IFilterBarProps {
    const statusCodeFilters = getStatusCodeFilterSummaries(state).map(
        addStatusCodeDisplayProperties
    );

    statusCodeFilters.sort((a, b) => b.statusCode - a.statusCode);

    return {
        groups: [
            {
                name: 'agent',
                filters: getAgentFilterSummaries(state).map(addAgentDisplayProperties)
            },
            { name: 'statusCode', filters: statusCodeFilters }
        ]
    };
}

function mapDispatchToProps(dispatch): IFilterBarCallbacks {
    return {
        onShowAll: () => {
            dispatch(resetAllAction());
        },
        onToggle: (name: string, groupName: string, index: number) => {
            if (groupName === 'agent') {
                dispatch(toggleAgentAction(AgentType[name]));
            } else if (groupName === 'statusCode') {
                dispatch(toggleStatusCodeClassAction(StatusCodeClass[name]));
            }
        }
    };
}

// tslint:disable-next-line:variable-name
export const ServiceFilterBar = connect(mapStateToProps, mapDispatchToProps)(FilterBar);

export default ServiceFilterBar;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/service/views/ServiceFilterBar.ts