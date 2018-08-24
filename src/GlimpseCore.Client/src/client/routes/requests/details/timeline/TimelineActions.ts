import * as Glimpse from '@glimpse/glimpse-definitions';
import { messageTargetId } from 'client/common/util/CommonUtilities';

import {
    createActionCreator,
    createRequestPersistedActionCreator,
    createSimpleActionCreator
} from 'common/actions/ActionCreator';
import {
    TimelineEventCategory,
    ITimelineSpan,
    ITimelineOffsetsActionConfig,
    AgentType
} from 'routes/requests/details/timeline/TimelineInterfaces';
import { push } from 'react-router-redux';
import { getSelectedServiceExchangePath } from 'routes/requests/details/service/ServiceConfig';
import { getSelectedDataExchangePath } from 'routes/requests/details/data/DataConfig';

export const toggleCategoryActionID = 'request.detail.timeline.toggleCategory';
export const toggleAgentActionID = 'request.detail.timeline.toggleAgent';
export const resetAllActionID = 'request.detail.timeline.resetAll';
export const selectOffsetsActionID = 'request.detail.timeline.selectOffsets';
export const resetOffsetsActionID = 'request.detail.timeline.resetOffsets';
export const highlightOffsetsActionID = 'request.details.timeline.highlightOffsets';
export const resetHighlightedOffsetsActionID = 'request.details.timeline.resetHighlightedOffsets';

export const resetAllAction = createSimpleActionCreator(resetAllActionID);
export const toggleCategoryAction = createActionCreator<number>(toggleCategoryActionID);
export const toggleAgentAction = createActionCreator<number>(toggleAgentActionID);
export const selectOffsetsAction = createRequestPersistedActionCreator<
    ITimelineOffsetsActionConfig
>(selectOffsetsActionID);
export const highlightOffsetsAction = createRequestPersistedActionCreator<
    ITimelineOffsetsActionConfig
>(highlightOffsetsActionID);
export const resetOffsetsAction = createRequestPersistedActionCreator<ITimelineOffsetsActionConfig>(
    resetOffsetsActionID
);
export const resetHighlightedOffsetsAction = createRequestPersistedActionCreator<
    ITimelineOffsetsActionConfig
>(resetHighlightedOffsetsActionID);

export const routeActivityAction = (requestId: string, activity: ITimelineSpan) => {
    return dispatch => {
        const { category, eventId } = activity;

        switch (category) {
            case TimelineEventCategory.WebService:
                dispatch(push(getSelectedServiceExchangePath(requestId, eventId)));
                break;

            case TimelineEventCategory.Data:
                dispatch(push(getSelectedDataExchangePath(requestId, eventId)));
                break;

            case TimelineEventCategory.Request:
                if (activity.source === AgentType.Server && activity.rawMessages.length) {
                    const correlationId = (activity.rawMessages[0]
                        .payload as Glimpse.Messages.Payloads.Middleware.IStart).correlationId;
                    dispatch(
                        push(`/requests/${requestId}/request#${messageTargetId(correlationId)}`)
                    );
                    window.requestAnimationFrame(() => {
                        window.location.href = `${window.location.pathname}${window.location
                            .search}#${messageTargetId(correlationId)}`;
                    });
                }
                break;

            // TODO: handle other categories
            default:
                break;
        }
    };
};



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/TimelineActions.ts