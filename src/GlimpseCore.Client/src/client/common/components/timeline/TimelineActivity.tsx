import React from 'react';

import { ITimelineComponentSpan } from './TimelineCommonInterfaces';

import styles from './TimelineActivity.scss';

enum MetadataSide {
    None = 0,
    Left,
    Right,
    Inline
}

function getMetadataSide(
    leftSize: number,
    barSize: number,
    rightSize: number,
    metadata
): MetadataSide {
    if (metadata) {
        if (rightSize >= leftSize && rightSize > barSize / 2) {
            return MetadataSide.Right;
        } else if (leftSize > rightSize && leftSize > barSize / 2) {
            return MetadataSide.Left;
        }

        return MetadataSide.Inline;
    }

    return MetadataSide.None;
}

/**
 * The properties of the TimelineActivity component.
 */
interface ITimelineActivityProps {
    /**
     * The activity associated with this component.
     */
    activity: ITimelineComponentSpan;

    /**
     * A function that generates the activity bar for the activity.
     * 
     * Notes:
     * 
     *  - The bar will be scaled/placed appropriately given its offset and duration.
     *  - The metadata (if any) will be placed appropriately (i.e. left/right) or passed to the function to be placed inline.
     */
    activityBarFunc: (activity: ITimelineComponentSpan, params, metadata) => JSX.Element;

    /**
     * The minimum-offset of the timeline.
     */
    minOffset: number;

    /**
     * The maximum-offset of the timeline.
     */
    maxOffset: number;

    /**
     * (Optional) The metadata to be displayed with the activity bar.
     */
    metadata?;

    /**
     * (Optional) Additional parameters to be passed to activityBarFunc().
     */
    params?;
}

// tslint:disable-next-line:variable-name
const TimelineActivity = (props: ITimelineActivityProps) => {
    const { activity, activityBarFunc, minOffset, maxOffset, metadata, params } = props;

    // Clamp the activity's begin- and end-points to the min- and max-endpoints of the table.
    const activityBeginOffset = Math.max(minOffset, Math.min(maxOffset, activity.offset));
    const activityEndOffset = Math.min(
        maxOffset,
        Math.max(minOffset, activity.offset + activity.duration)
    );
    const activityDuration = activityEndOffset - activityBeginOffset;

    const totalDuration = maxOffset - minOffset;

    const leftFlexGrow = (activityBeginOffset - minOffset) / totalDuration;
    const leftMarginStyle: React.CSSProperties = {
        display: 'flex',
        flexBasis: 0,
        flexDirection: 'row',
        flexGrow: leftFlexGrow,
        justifyContent: 'flex-end'
    };

    const barFlexGrow = activityDuration / totalDuration;
    const barMarginStyle: React.CSSProperties = {
        display: 'flex',
        flexBasis: 0,
        flexDirection: 'row',
        flexGrow: barFlexGrow,
        minWidth: '1px'
    };

    const rightFlexGrow = (maxOffset - activityEndOffset) / totalDuration;
    const rightMarginStyle: React.CSSProperties = {
        display: 'flex',
        flexBasis: 0,
        flexDirection: 'row',
        flexGrow: rightFlexGrow,
        justifyContent: 'flex-start'
    };

    const metadataSide = getMetadataSide(leftFlexGrow, barFlexGrow, rightFlexGrow, metadata);

    return (
        <div className={styles.timelineActivity}>
            <div style={leftMarginStyle}>
                {metadataSide === MetadataSide.Left ? metadata : undefined}
            </div>
            <div style={barMarginStyle}>
                {activityBarFunc(
                    activity,
                    params,
                    metadataSide === MetadataSide.Inline ? metadata : undefined
                )}
            </div>
            <div style={rightMarginStyle}>
                {metadataSide === MetadataSide.Right ? metadata : undefined}
            </div>
        </div>
    );
};

export default TimelineActivity;



// WEBPACK FOOTER //
// ./src/client/common/components/timeline/TimelineActivity.tsx