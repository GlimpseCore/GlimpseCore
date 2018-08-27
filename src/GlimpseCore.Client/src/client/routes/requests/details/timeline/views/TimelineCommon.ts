import { TimelineEventCategory } from '../TimelineInterfaces';

import styles from './TimelineCommon.scss';

const categoryBackgrounds = {
    [TimelineEventCategory.Data]: styles.timelineCategoryDataBackground,
    [TimelineEventCategory.Logs]: styles.timelineCategoryLogsBackground,
    [TimelineEventCategory.Other]: styles.timelineCategoryOtherBackground,
    [TimelineEventCategory.Request]: styles.timelineCategoryRequestBackground,
    [TimelineEventCategory.WebService]: styles.timelineCategoryWebServiceBackground
};

const categoryBorders = {
    [TimelineEventCategory.Data]: styles.timelineCategoryDataBorder,
    [TimelineEventCategory.Logs]: styles.timelineCategoryLogsBorder,
    [TimelineEventCategory.Other]: styles.timelineCategoryOtherBorder,
    [TimelineEventCategory.Request]: styles.timelineCategoryRequestBorder,
    [TimelineEventCategory.WebService]: styles.timelineCategoryWebServiceBorder
};

const categoryColors = {
    [TimelineEventCategory.Data]: styles.timelineCategoryDataColor,
    [TimelineEventCategory.Logs]: styles.timelineCategoryLogsColor,
    [TimelineEventCategory.Other]: styles.timelineCategoryOtherColor,
    [TimelineEventCategory.Request]: styles.timelineCategoryRequestColor,
    [TimelineEventCategory.WebService]: styles.timelineCategoryWebServiceColor
};

export function getBackgroundStyleForCategory(category: TimelineEventCategory): string {
    return categoryBackgrounds[category] || styles.timelineCategoryOtherBackground;
}

export function getBorderStyleForCategory(category: TimelineEventCategory): string {
    return categoryBorders[category] || styles.timelineCategoryOtherBorder;
}

export function getColorStyleForCategory(category: TimelineEventCategory): string {
    return categoryColors[category] || styles.timelineCategoryOtherColor;
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/views/TimelineCommon.ts