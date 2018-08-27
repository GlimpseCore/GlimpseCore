import * as Glimpse from '@glimpse/glimpse-definitions';
import range from 'lodash/range';
import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

import Icon from 'common/components/Icon';
import { IStoreState } from 'client/IStoreState';
import { TimeDuration, TimeDurationFormat } from 'common/components/TimeDuration';
import TimelineActivity from 'common/components/timeline/TimelineActivity';
import { getBackgroundStyleForCategory, getBorderStyleForCategory } from './TimelineCommon';
import { selectOffsetsAction, resetOffsetsAction } from '../TimelineActions';
import { ITimelineEvent, ITimelineSpan } from '../TimelineInterfaces';
import {
    getTimelineEventsOffsetBoundary,
    getOverviewTimelineEvents,
    getSelectedOffsetsForSelectedContext
} from '../TimelineSelectors';
import { getSelectedContextId, getSingleMessageByType } from 'routes/requests/RequestsSelector';
import {
    getBrowserNavigationTimingOffsets,
    IBrowserNavigationTimingOffsets,
    BrowserNavigationTimingSegments
} from 'routes/requests/RequestsOverviewSelector';
import { getSelectedRequest } from 'routes/requests/details/RequestsDetailsSelector';
import { getNamesForEnum } from 'common/util/CommonUtilities';
import { IDropdownOption, Dropdown } from 'common/components/Dropdown';

import styles from './TimelineOverview.scss';

export interface ITimelineOverviewProps {
    className?: string;
    requestId: string;
    spans: ITimelineSpan[];
    pointInTimeEvents: ITimelineEvent[];
    minOffset: number;
    maxOffset: number;
    maxEvents: number;
    offsetTicks: number;
    selectedMinOffset?: number;
    selectedMaxOffset?: number;
    highlightedMinOffset?: number;
    highlightedMaxOffset?: number;
    selectedSegment?: string;
    wasTruncated: boolean;
    browserNavigationTimingOffsets?: IBrowserNavigationTimingOffsets;
}

export interface ITimelineOverviewCallbacks {
    onSelectedOffsetsChanged?: (
        requestId: string,
        minOffset?: number,
        maxOffset?: number,
        segment?: string
    ) => void;
    onResetTimeline?: (requestId: string) => void;
}

enum DraggingState {
    NotDragging,
    DraggingLeft,
    DraggingRight
}

interface IBrowserNavigationTimingMap {
    Reset: string;
    Custom: string;
    PageLoad: string;
    NetworkConnection: string;
    SendingRequest: string;
    ReceivingResponse: string;
    BrowserProcessing: string;
}

export const browserNavigationTimingLabels: IBrowserNavigationTimingMap = {
    Reset: 'Show all',
    Custom: 'Custom',
    PageLoad: 'Page load time',
    NetworkConnection: 'Network connection',
    SendingRequest: 'Sending request',
    ReceivingResponse: 'Receiving response',
    BrowserProcessing: 'Browser processing'
};

const browserNavigationTimingLabelsEnumsMap = {
    'Page load time': 0,
    'Network connection': 1,
    'Sending request': 2,
    'Receiving response': 3,
    'Browser processing': 4
};

export class TimelineOverviewView extends React.Component<
    ITimelineOverviewProps & ITimelineOverviewCallbacks,
    {}
> {
    private gripContainer: HTMLElement;
    private leftGrip: HTMLElement;
    private rightGrip: HTMLElement;

    constructor(props?: ITimelineOverviewProps) {
        super(props);

        if (!props) {
            throw new Error('TimelineDetailsView requires properties be set.');
        }

        if (props.maxOffset <= props.minOffset) {
            throw new Error('maxOffset must be greater than minOffset.');
        }

        if (props.offsetTicks <= 0) {
            throw new Error('offsetTicks must be greater than 0.');
        }

        this.onMouseDown = this.onMouseDown.bind(this);
    }

    public render() {
        const { className } = this.props;

        return (
            <div className={classNames(styles.timelineOverview, className)}>
                <div className={styles.timelineOverviewMessageBar}>
                    {this.renderMessage()}
                    {this.renderSelectRange()}
                </div>
                <div className={styles.timelineOverviewTable}>
                    {this.renderTableLayer()}
                    {this.renderSelectionLayer()}
                </div>
            </div>
        );
    }

    private renderMessage() {
        const { wasTruncated } = this.props;

        if (wasTruncated) {
            const text =
                'Some shorter-duration events are hidden. You can still find all events in the table below.';

            return (
                <div title={text} className={styles.timelineOverviewMessage}>
                    <Icon shape="Warning" className={styles.timelineOverviewMessageIcon} />
                    <span className={styles.timelineOverviewMessageText}>{text}</span>
                </div>
            );
        }

        return undefined;
    }

    private handleSelectRangeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target;
        const { onSelectedOffsetsChanged, requestId, browserNavigationTimingOffsets } = this.props;

        switch (value) {
            case 'Show all':
                this.onResetTimeline();
                return;

            default:
                if (!browserNavigationTimingOffsets) {
                    return;
                }

                const browserNavigationTimingEnum = browserNavigationTimingLabelsEnumsMap[value];
                const { offsets } = browserNavigationTimingOffsets[browserNavigationTimingEnum];
                onSelectedOffsetsChanged(requestId, offsets.start, offsets.end, value);
                return;
        }
    };

    private renderSelectRange() {
        const { browserNavigationTimingOffsets, selectedSegment = '' } = this.props;
        const navigationOptionsDisabled = !browserNavigationTimingOffsets;

        const options: IDropdownOption[] = [
            { value: 'Custom', disabled: true },
            { value: 'Show all' },
            ...getNamesForEnum(BrowserNavigationTimingSegments).map(key => {
                return {
                    value: browserNavigationTimingLabels[key],
                    disabled: navigationOptionsDisabled
                } as IDropdownOption;
            })
        ];

        return (
            <Dropdown
                className={styles.timelineOverviewSelect}
                onChange={this.handleSelectRangeChange}
                selected={this.getSelectHeaderName(selectedSegment)}
                options={options}
            />
        );
    }

    private getSelectHeaderName(selectedSegment: string): string {
        if (selectedSegment === '') {
            return browserNavigationTimingLabels.Custom;
        }
        if (selectedSegment === 'reset') {
            return browserNavigationTimingLabels.Reset;
        }

        return selectedSegment;
    }

    private onResetTimeline() {
        const { requestId, onResetTimeline } = this.props;

        if (onResetTimeline) {
            onResetTimeline(requestId);
        }
    }

    private renderTableLayer() {
        return (
            <div className={styles.timelineOverviewTableLayer}>
                {this.renderHeaders()}
                {this.renderCellLayer()}
            </div>
        );
    }

    private renderHeaders() {
        const { minOffset, maxOffset, offsetTicks } = this.props;
        const tickValue = (maxOffset - minOffset) / offsetTicks;

        return (
            <div className={styles.timelineOverviewHeaders}>
                {range(1, offsetTicks + 1).map(index =>
                    <div key={index.toString()} className={styles.timelineOverviewHeader}>
                        <TimeDuration
                            duration={minOffset + index * tickValue}
                            format={TimeDurationFormat.WholeMillesecondsFractionalSeconds}
                        />
                    </div>
                )}
            </div>
        );
    }

    private renderCellLayer() {
        const { maxEvents } = this.props;

        // NOTE: Height is assumed to be 1px with 0.5px top/bottom margin.
        //       This must change if/when the CSS changes.

        const height = maxEvents * 2;

        const containerStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            height: `${height}px`,
            position: 'relative'
        };

        return (
            <div style={containerStyle}>
                {this.renderCells()}
                {this.renderActivities()}
                {this.renderEvents()}
            </div>
        );
    }

    private renderCells() {
        const { offsetTicks } = this.props;

        return (
            <div className={styles.timelineOverviewCells}>
                {range(1, offsetTicks + 1).map(index =>
                    <div key={index.toString()} className={styles.timelineOverviewCell} />
                )}
            </div>
        );
    }

    private renderActivities() {
        const { spans, minOffset, maxOffset } = this.props;

        return (
            <div className={styles.timelineOverviewActivities}>
                {spans.map(activity =>
                    <TimelineActivity
                        key={activity.eventId}
                        activity={activity}
                        activityBarFunc={TimelineOverviewView.renderActivity}
                        minOffset={minOffset}
                        maxOffset={maxOffset}
                    />
                )}
            </div>
        );
    }

    private static renderActivity(activity: ITimelineSpan, params, metadata) {
        return (
            <div
                className={classNames(
                    styles.timelineOverviewActivity,
                    getBackgroundStyleForCategory(activity.category)
                )}
            />
        );
    }

    private renderEvents() {
        const { pointInTimeEvents } = this.props;

        return (
            <div className={styles.timelineOverviewEvents}>
                {pointInTimeEvents.map(event => this.renderEvent(event))}
            </div>
        );
    }

    private renderEvent(event: ITimelineEvent) {
        const { minOffset, maxOffset } = this.props;

        const totalDuration = maxOffset - minOffset;
        const midOffset = minOffset + totalDuration / 2;

        const containerStyle: React.CSSProperties = {
            display: 'flex',
            position: 'absolute',
            top: 0,
            bottom: 0
        };

        // NOTE: To ensure visibility, we layout the event from the left or
        //       right depending on which "half" of the overview it will reside.

        if (event.offset <= midOffset) {
            const proportion = event.offset / totalDuration;
            const left = `${proportion * 100}%`;

            containerStyle.left = left;
        } else {
            const proportion = 1 - event.offset / totalDuration;
            const right = `${proportion * 100}%`;

            containerStyle.right = right;
        }

        return (
            <div key={event.eventId} style={containerStyle}>
                <div
                    className={classNames(
                        styles.timelineOverviewEvent,
                        getBorderStyleForCategory(event.category)
                    )}
                />
            </div>
        );
    }

    private renderHighlightLayer() {
        const { minOffset, maxOffset, highlightedMinOffset, highlightedMaxOffset } = this.props;

        if (!highlightedMinOffset || !highlightedMaxOffset) {
            return undefined;
        }

        // Clamp the highlight's begin- and end-points to the min- and max-endpoints of the control...
        const clampedHighlightedMinOffset = Math.max(
            minOffset,
            Math.min(maxOffset, highlightedMinOffset || minOffset)
        );
        const clampedHighlightedMaxOffset = Math.min(
            maxOffset,
            Math.max(minOffset, highlightedMaxOffset || maxOffset)
        );

        const totalDuration = maxOffset - minOffset;

        const containerStyle: React.CSSProperties = {
            width: `${100 *
                (clampedHighlightedMaxOffset - clampedHighlightedMinOffset) /
                totalDuration}%`,
            left: `${100 * clampedHighlightedMinOffset / totalDuration}%`
        };

        return <div style={containerStyle} className={styles.timelineOverviewHighlight} />;
    }

    private renderSelectionLayer() {
        const { minOffset, maxOffset, selectedMinOffset, selectedMaxOffset } = this.props;

        // Clamp the selection's begin- and end-points to the min- and max-endpoints of the control...
        const effectiveSelectedMinOffset = Math.max(
            minOffset,
            Math.min(maxOffset, selectedMinOffset || minOffset)
        );
        const effectiveSelectedMaxOffset = Math.min(
            maxOffset,
            Math.max(minOffset, selectedMaxOffset || maxOffset)
        );

        const totalDuration = maxOffset - minOffset;

        const containerStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'row',
            flexGrow: 1,
            position: 'relative'
        };

        const leftMarginStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            flex: 'none',
            width: `${(effectiveSelectedMinOffset - minOffset) / totalDuration * 100}%`
        };

        const barMarginStyle: React.CSSProperties = {
            display: 'flex',
            flexGrow: 1
        };

        const rightMarginStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            flex: 'none',
            width: `${(maxOffset - effectiveSelectedMaxOffset) / totalDuration * 100}%`
        };

        return (
            <div className={styles.timelineOverviewSelectionLayer}>
                <div
                    ref={gripContainer => (this.gripContainer = gripContainer)}
                    style={containerStyle}>
                    <div style={leftMarginStyle}>
                        <div className={styles.timelineOverviewUnselected} />
                    </div>
                    <div
                        ref={leftGrip => (this.leftGrip = leftGrip)}
                        className={styles.timelineOverviewGripContainer}
                        onMouseDown={this.onMouseDown}>
                        {this.renderGrip(/* isLeft: */ true)}
                    </div>
                    <div style={barMarginStyle}>
                        {this.renderSelection()}
                    </div>
                    <div
                        ref={rightGrip => (this.rightGrip = rightGrip)}
                        className={styles.timelineOverviewGripContainer}
                        onMouseDown={this.onMouseDown}>
                        {this.renderGrip(/* isLeft: */ false)}
                    </div>
                    <div style={rightMarginStyle}>
                        <div className={styles.timelineOverviewUnselected} />
                    </div>
                    {this.renderHighlightLayer()}
                </div>
            </div>
        );
    }

    private renderGrip(isLeft: boolean) {
        return (
            <div className={styles.timelineOverviewGrip}>
                <div
                    className={
                        isLeft
                            ? styles.timelineOverviewGripHandleLeft
                            : styles.timelineOverviewGripHandleRight
                    }>
                    &nbsp;
                </div>
                <div
                    className={
                        isLeft ? styles.timelineOverviewGripLeft : styles.timelineOverviewGripRight
                    }
                />
            </div>
        );
    }

    private renderSelection() {
        return (
            <div className={styles.timelineOverviewSelection}>
                <div className={styles.timelineOverviewSelectionHeaders}>&nbsp;</div>
                <div className={styles.timelineOverviewSelectionCells} />
            </div>
        );
    }

    private onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        const dragging = e.currentTarget === this.leftGrip
            ? DraggingState.DraggingLeft
            : DraggingState.DraggingRight;

        const grip = dragging === DraggingState.DraggingLeft ? this.leftGrip : this.rightGrip;

        const gripContainerRect = this.gripContainer.getBoundingClientRect();
        const leftGripRight = this.leftGrip.getBoundingClientRect().right - gripContainerRect.left;
        const rightGripLeft = this.rightGrip.getBoundingClientRect().left - gripContainerRect.left;

        const minLeft = dragging === DraggingState.DraggingLeft ? 0 : leftGripRight + 1;

        const maxLeft = dragging === DraggingState.DraggingLeft
            ? rightGripLeft - 1
            : gripContainerRect.right - gripContainerRect.left;

        let delta = 0;
        let lastPageX;
        let originalLeft = grip.getBoundingClientRect().left - gripContainerRect.left;
        let gripLeft = originalLeft;

        const onMouseMoveHandler = (me: MouseEvent) => {
            delta += me.pageX - lastPageX;
            lastPageX = me.pageX;

            gripLeft = Math.max(minLeft, Math.min(originalLeft + delta, maxLeft));

            grip.style.left = `${gripLeft}px`;

            me.preventDefault();
        };

        const onMouseUpHandler = (me: MouseEvent) => {
            document.removeEventListener('mousemove', onMouseMoveHandler);
            document.removeEventListener('mouseup', onMouseUpHandler);

            const newProportion = gripLeft / (gripContainerRect.right - gripContainerRect.left);
            const { minOffset, maxOffset, onSelectedOffsetsChanged } = this.props;
            const newOffset = minOffset + newProportion * (maxOffset - minOffset);

            if (onSelectedOffsetsChanged) {
                const { requestId, selectedMinOffset, selectedMaxOffset } = this.props;

                if (dragging === DraggingState.DraggingLeft) {
                    onSelectedOffsetsChanged(requestId, newOffset, selectedMaxOffset);
                } else {
                    onSelectedOffsetsChanged(requestId, selectedMinOffset, newOffset);
                }
            }

            grip.style.position = '';
            grip.style.left = '';
            grip.style.top = '';
            grip.style.bottom = '';

            me.preventDefault();
        };

        lastPageX = e.pageX;

        grip.style.position = 'absolute';
        grip.style.left = `${gripLeft}px`;
        grip.style.top = '0px';
        grip.style.bottom = '0px';

        document.addEventListener('mousemove', onMouseMoveHandler);
        document.addEventListener('mouseup', onMouseUpHandler);

        e.preventDefault();
    }
}

function mapStateToProps(state: IStoreState, props): ITimelineOverviewProps {
    const { className } = props;
    const { spans, pointInTimeEvents, maxEvents, wasTruncated } = getOverviewTimelineEvents(state);

    const boundary = getTimelineEventsOffsetBoundary(state);
    const selectedOffsets = getSelectedOffsetsForSelectedContext(state);

    const { context } = getSelectedRequest(state);
    const browserNavigationTiming = getSingleMessageByType<
        Glimpse.Messages.Payloads.Browser.INavigationTiming
    >(context.byType, Glimpse.Messages.Payloads.Browser.NavigationTimingType);
    const browserNavigationTimingOffsets = browserNavigationTiming &&
        browserNavigationTiming.payload
        ? getBrowserNavigationTimingOffsets(browserNavigationTiming.payload)
        : undefined;

    return {
        className,
        requestId: getSelectedContextId(state),
        spans,
        pointInTimeEvents,
        minOffset: boundary.minOffset,
        maxOffset: boundary.maxOffset,
        maxEvents,
        offsetTicks: 7,
        selectedMinOffset: selectedOffsets.minOffset,
        selectedMaxOffset: selectedOffsets.maxOffset,
        highlightedMinOffset: selectedOffsets.highlightedMinOffset,
        highlightedMaxOffset: selectedOffsets.highlightedMaxOffset,
        selectedSegment: selectedOffsets.segment,
        wasTruncated,
        browserNavigationTimingOffsets
    };
}

function mapDispatchToProps(dispatch): ITimelineOverviewCallbacks {
    return {
        onSelectedOffsetsChanged: (
            requestId: string,
            minOffset?: number,
            maxOffset?: number,
            segment?: string
        ) => {
            dispatch(
                selectOffsetsAction({
                    requestId,
                    minOffset,
                    maxOffset,
                    segment
                })
            );
        },
        onResetTimeline: (requestId: string) => {
            dispatch(resetOffsetsAction({ requestId }));
        }
    };
}

const TimelineOverview = connect(mapStateToProps, mapDispatchToProps)(TimelineOverviewView); // tslint:disable-line:variable-name

export default TimelineOverview;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/views/TimelineOverview.tsx