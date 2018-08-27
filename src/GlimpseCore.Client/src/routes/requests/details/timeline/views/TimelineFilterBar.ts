import { connect } from 'react-redux';

import { getColorStyleForCategory } from './TimelineCommon';
import { getAgentFilterSummaries, getCategoryFilterSummaries } from '../TimelineSelectors';
import { IFilterBarProps, IFilterBarCallbacks, FilterBar } from 'common/components/FilterBar';
import { IStoreState } from 'client/IStoreState';
import loggingFilterBarStyles from 'routes/requests/details/logging/views/LoggingFilterBar.scss';
import { toggleCategoryAction, toggleAgentAction, resetAllAction } from '../TimelineActions';
import { TimelineEventCategory, AgentType } from '../TimelineInterfaces';

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

function addCateogryDisplayProperties(filter) {
    return {
        displayName: filter.name,
        icon: 'CategorySquare',
        iconPathClassName: getColorStyleForCategory(filter.category),
        ...filter
    };
}

function mapStateToProps(state: IStoreState): IFilterBarProps {
    return {
        groups: [
            {
                name: 'agent',
                filters: getAgentFilterSummaries(state).map(addAgentDisplayProperties)
            },
            {
                name: 'category',
                filters: getCategoryFilterSummaries(state).map(addCateogryDisplayProperties)
            }
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
            } else if (groupName === 'category') {
                // assume that the index is the enum value
                dispatch(toggleCategoryAction(index as TimelineEventCategory));
            }
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterBar);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/views/TimelineFilterBar.ts