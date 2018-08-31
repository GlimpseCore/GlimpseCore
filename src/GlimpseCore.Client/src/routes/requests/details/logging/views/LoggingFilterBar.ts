import { connect } from 'react-redux';

import { AgentType } from '@routes/requests/details/timeline/TimelineInterfaces';
import {
    LoggingMessageLevel,
    ILoggingAgentSummary,
    ILoggingLevelSummary
} from '../LoggingInterfaces';
import { toggleLevelAction, toggleAgentAction, showAllAction } from '../LoggingActions';
import { getLevelFiltersSummaries, getAgentFiltersSummaries } from '../LoggingSelectors';

import { selectCategoryAction } from '@routes/requests/details/logging/LoggingActions';

import styles from './LoggingFilterBar.scss';
import { IFilterBarProps, IFilterBarCallbacks, FilterBar } from '@common/components/FilterBar';
import { IStoreState } from '@client/IStoreState';
import { IDropdownOption } from '@common/components/Dropdown';

import {
    getCurrentExploredCategoriesCount,
    getExploredCategories,
    getSelectedCategory
} from '../LoggingSelectors';

import { selectedCategoryInitialState } from '../LoggingReducers';

function addAgentDisplayProperties(filter: ILoggingAgentSummary) {
    switch (filter.agent) {
        case AgentType.Browser:
            return {
                displayName: filter.name,
                icon: 'Client',
                iconPathClassName: styles.agentBrowserIcon,
                ...filter
            };

        case AgentType.Server:
            return {
                displayName: filter.name,
                icon: 'Server',
                iconPathClassName: styles.agentServerIcon,
                ...filter
            };

        default:
            return filter;
    }
}

function addLevelDisplayProperties(filter: ILoggingLevelSummary) {
    let icon: IconShapeType;
    let iconPathClassName: string;

    switch (filter.level) {
        case LoggingMessageLevel.Error:
            icon = 'TimesCircle';
            iconPathClassName = styles.levelErrorIcon;
            break;
        case LoggingMessageLevel.Warning:
            icon = 'Warning';
            iconPathClassName = styles.levelWarningIcon;
            break;
        case LoggingMessageLevel.Info:
            icon = 'InfoLogs';
            iconPathClassName = styles.levelInfoIcon;
            break;
        default:
            break;
    }

    return { displayName: filter.name, icon, iconPathClassName, ...filter };
}

function mapStateToProps(state: IStoreState, props): IFilterBarProps {
    const selectCategory = getSelectedCategory(state);
    const exploredCategories = getExploredCategories(state);
    const currentExploredCategoriesCount = getCurrentExploredCategoriesCount(state);

    const dropdownOptions: IDropdownOption[] = [
        { value: selectedCategoryInitialState },
        ...Object.keys(exploredCategories).map(function(value) {
            const count = currentExploredCategoriesCount[value];
            return {
                value,
                disabled: count === undefined,
                append: ` (${count || 0})`
            };
        })
    ];

    const groups = [
        {
            name: 'agent',
            filters: getAgentFiltersSummaries(state).map(addAgentDisplayProperties)
        },
        {
            name: 'level',
            filters: getLevelFiltersSummaries(state).map(addLevelDisplayProperties),
            className: styles.levelGroup
        },
        {
            type: 'dropdown',
            name: selectCategory,
            default: selectedCategoryInitialState,
            filters: dropdownOptions
        }
    ];

    // if there is no categories, remove the categories dropdown
    if (dropdownOptions.length < 2) {
        groups.length = 2;
    }

    return { groups } as IFilterBarProps;
}

function mapDispatchToProps(dispatch): IFilterBarCallbacks {
    return {
        onShowAll: () => {
            dispatch(showAllAction());
        },
        onToggle: (name: string, groupName: string, index: number) => {
            if (groupName === 'agent') {
                dispatch(toggleAgentAction(AgentType[name]));
            } else if (groupName === 'level') {
                dispatch(toggleLevelAction(LoggingMessageLevel[name]));
            }
        },
        onDropdownChange: (i: number, e) => {
            dispatch(selectCategoryAction(e.target.value));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterBar);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/logging/views/LoggingFilterBar.ts