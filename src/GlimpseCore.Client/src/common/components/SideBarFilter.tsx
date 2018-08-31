import React from 'react';
import { IRequestFilterDetails } from '@client/routes/requests/RequestsFilterInterfaces';
import { IRequestsFilterState } from '@client/routes/requests/RequestsFilterInterfaces';
import { methodNames, isFilterReset } from '@client/routes/requests/RequestsFilterSelectors';
import Icon from '@common/components/Icon';
import classNames from 'classnames';
import { FilterButton } from '@common/components/FilterButton';
import {
    getColorStyleForStatusCode,
    getIconForStatusCode
} from '@routes/requests/details/service/views/ServiceCommon';
import { StatusCodeClass } from '@routes/requests/details/service/ServiceInterfaces';
import serviceCommonStyles from '@routes/requests/details/service/views/ServiceCommon.scss';
import {
    getStatusCodeShortNames,
    getStatusCodeRange
} from '@routes/requests/details/service/ServiceUtils';
import { getNamesForEnum } from '@common/util/CommonUtilities';
import { ContentTypeClass } from '@common/util/ContentTypes';
import Hammer from 'hammerjs';

import styles from './SideBarFilter.scss';
import { IconShapeType } from '@common/components/AgentTypeIcon';

interface ISideBarFilterProps {
    requestFilterDetails: IRequestFilterDetails;
    onFilterChange: (filterState: IRequestsFilterState) => void;
    onFilterReset: () => void;
    filters: IRequestsFilterState;
}

interface ISideBarFilterState {
    showAll: {
        method: boolean;
        contentType: boolean;
    };
    height: number;
    deltaY: number;
}

interface IFilterGroupConfig<NameType> {
    filterNames: NameType[];
    defaultFilterNames: NameType[];
    getDisplayName?: (filterName: NameType) => string;
    type: 'method' | 'status' | 'contentType';
    getTotalCount: (filterName: NameType) => number;
    showAllNames?: boolean;
    title: string;
    isActiveFilterName: (filterName: NameType) => boolean;
    onToggleFilter: (filterName: NameType) => void;
    icon?: (filterName: NameType) => IconShapeType;
    iconClassName?: (filterName: NameType) => string;
    iconPathClassName?: (filterName: NameType) => string;
}

const defaultMethodNames = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const statusCodeClasses = [
    StatusCodeClass.ServerError,
    StatusCodeClass.ClientError,
    StatusCodeClass.Redirection,
    StatusCodeClass.Success,
    StatusCodeClass.Informational
];
const defaultStatusCodeClasses = statusCodeClasses;

const filterableContentTypeNames = getNamesForEnum(ContentTypeClass)
    .filter(n => {
        return n !== 'None' && n !== 'All';
    })
    .sort((a, b) => {
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        }
        return 0;
    });

const defaultContentTypes = ['Data', 'Document', 'Image', 'Script', 'Style'];

export default class SideBarFilter extends React.Component<
    ISideBarFilterProps,
    ISideBarFilterState
> {
    /**
     * HammerJS manager
     */
    private mc;
    private grip: Element;

    public static minGripHeight = 100;

    constructor(props) {
        super(props);

        this.state = {
            showAll: {
                method: false,
                contentType: false
            },
            height: 270,
            deltaY: 0
        };
    }
    private toggle = (type: string, name: string | number): void => {
        const { filters, onFilterChange } = this.props;

        const updatedType = { ...filters[type] };

        if (filters[type][name]) {
            delete updatedType[name];
        } else {
            updatedType[name] = true;
        }

        const newFilters: IRequestsFilterState = {
            ...filters,
            [type]: updatedType
        };

        onFilterChange(newFilters);
    };
    private toggleContentType(contentType: number) {
        const { filters, onFilterChange } = this.props;
        const { contentTypeClass } = filters;

        const newFilters: IRequestsFilterState = {
            ...filters,
            contentTypeClass: contentTypeClass ^ contentType // tslint:disable-line:no-bitwise
        };

        onFilterChange(newFilters);
    }
    private toggleShowAll(group: string): void {
        this.setState({
            showAll: {
                ...this.state.showAll,
                [group]: !this.state.showAll[group]
            }
        });
    }
    private renderFilterGroup<NameType>(options: IFilterGroupConfig<NameType>) {
        const {
            filterNames,
            defaultFilterNames,
            getDisplayName,
            type,
            showAllNames,
            title,
            isActiveFilterName,
            onToggleFilter,
            getTotalCount,
            icon,
            iconClassName,
            iconPathClassName
        } = options;

        return (
            <div
                className={classNames({
                    [styles.filterGroupShowAll]: showAllNames
                })}>
                <div className={styles.filterGroupHeading}>{title}</div>
                {filterNames.map(filterName =>
                    <FilterButton
                        className={classNames({
                            [styles.optionalFilter]: defaultFilterNames.indexOf(filterName) < 0
                        })}
                        icon={icon ? icon(filterName) : undefined}
                        iconClassName={iconClassName ? iconClassName(filterName) : undefined}
                        iconPathClassName={
                            iconPathClassName ? iconPathClassName(filterName) : undefined
                        }
                        data-iconPathClassName={
                            iconPathClassName ? iconPathClassName(filterName) : undefined
                        }
                        count={getTotalCount(filterName) || 0}
                        isShown={!isActiveFilterName(filterName)}
                        key={filterName.toString()}
                        name={filterName.toString()}
                        displayName={getDisplayName ? getDisplayName(filterName) : undefined}
                        onToggle={() => onToggleFilter(filterName)}
                    />
                )}
                {showAllNames !== undefined &&
                    <div
                        className={styles.showMoreContainer}
                        onClick={() => this.toggleShowAll(type)}>
                        <Icon
                            className={styles.showMoreIcon}
                            shape={showAllNames ? 'ChevronUp' : 'ChevronDown'}
                        />
                        <div>
                            {showAllNames
                                ? `Show fewer ${title.toLowerCase()}`
                                : `Show more ${title.toLowerCase()}`}
                        </div>
                    </div>}
            </div>
        );
    }
    private handleFilterReset = e => {
        e.preventDefault();
        e.stopPropagation();

        this.props.onFilterReset();
    };
    private attachGrip = (gripNode: Element): void => {
        this.grip = gripNode;
    };
    private handlePan = (e: HammerInput): void => {
        switch (e.type) {
            case 'panend':
                this.setState({
                    height: Math.max(
                        this.state.height + this.state.deltaY,
                        SideBarFilter.minGripHeight
                    ),
                    deltaY: 0
                });
                break;
            default:
                this.setState({
                    deltaY: e.deltaY
                });
                break;
        }
    };
    public componentDidMount() {
        this.mc = new Hammer.Manager(this.grip);
        this.mc.add(new Hammer.Pan({ direction: Hammer.DIRECTION_VERTICAL }));
        this.mc.on('panup pandown panend', a => this.handlePan(a));
    }
    public render() {
        const { requestFilterDetails, filters } = this.props;
        const { showAll } = this.state;
        const { method, status, contentTypeClass } = requestFilterDetails.indexedTotalCount;

        return (
            <div
                className={classNames(styles.sideBarFilterContainer)}
                style={{ height: this.state.height + this.state.deltaY }}>
                <div className={styles.sideBarFilterContent}>
                    <div className={styles.sideBarFilterGroups}>
                        {this.renderFilterGroup<string>({
                            title: 'Methods',
                            filterNames: methodNames,
                            defaultFilterNames: defaultMethodNames,
                            type: 'method',
                            getTotalCount: filterName => method[filterName],
                            showAllNames: showAll.method,
                            isActiveFilterName: filterName => filters.method[filterName],
                            onToggleFilter: filterName => this.toggle('method', filterName)
                        })}

                        {this.renderFilterGroup<StatusCodeClass>({
                            title: 'Statuses',
                            filterNames: statusCodeClasses,
                            defaultFilterNames: defaultStatusCodeClasses,
                            getDisplayName: statusCodeClass =>
                                getStatusCodeShortNames(statusCodeClass),
                            type: 'status',
                            getTotalCount: statusCodeClass =>
                                status[getStatusCodeRange(statusCodeClass)],
                            isActiveFilterName: statusCodeClass =>
                                filters.status[getStatusCodeRange(statusCodeClass)],
                            onToggleFilter: statusCodeClass =>
                                this.toggle('status', getStatusCodeRange(statusCodeClass)),
                            icon: statusCodeClass => getIconForStatusCode(statusCodeClass),
                            iconClassName: () => serviceCommonStyles.statusCodeIcon,
                            iconPathClassName: statusCodeClass =>
                                getColorStyleForStatusCode(statusCodeClass)
                        })}

                        {this.renderFilterGroup<string>({
                            title: 'File types',
                            filterNames: filterableContentTypeNames,
                            defaultFilterNames: defaultContentTypes,
                            type: 'contentType',
                            getTotalCount: contentTypeName =>
                                contentTypeClass[ContentTypeClass[contentTypeName]],
                            showAllNames: showAll.contentType,
                            isActiveFilterName: contentTypeName =>
                                // tslint:disable-next-line:no-bitwise
                                (filters.contentTypeClass & ContentTypeClass[contentTypeName]) !==
                                ContentTypeClass[contentTypeName],
                            onToggleFilter: contentTypeName =>
                                this.toggleContentType(+ContentTypeClass[contentTypeName])
                        })}
                    </div>
                    <div className={styles.sideBarFilterActions}>
                        <div className={styles.sideBarFilterActionsHeading}>
                            Showing {requestFilterDetails.filteredCount}
                            {' '}{requestFilterDetails.filteredCount === 1 ? 'request' : 'requests'}
                        </div>
                        {!isFilterReset(filters) &&
                            <button
                                type="button"
                                className={styles.sideBarFilterActionsButton}
                                onClick={this.handleFilterReset}>
                                Reset filters
                            </button>}
                    </div>
                    <div className={styles.sideBarFilterGrip} ref={this.attachGrip} />
                </div>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/client/common/components/SideBarFilter.tsx