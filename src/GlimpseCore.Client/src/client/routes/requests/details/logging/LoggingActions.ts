import { createActionCreator, createSimpleActionCreator } from 'common/actions/ActionCreator';
import { ILoggingExploredCategories } from './LoggingInterfaces';

export const showAllActionID = 'request.detail.logging.showAll';
export const toggleLevelActionID = 'request.detail.logging.toggleLevel';
export const toggleAgentActionID = 'request.detail.logging.toggleAgent';
export const addExploredCategoryID = 'request.detail.logging.addExploredCategory';
export const selectCategoryID = 'request.detail.logging.selectCategory';

export const showAllAction = createSimpleActionCreator(showAllActionID);
export const toggleLevelAction = createActionCreator<number>(toggleLevelActionID);
export const toggleAgentAction = createActionCreator<number>(toggleAgentActionID);
export const addExploredCategoryAction = createActionCreator<ILoggingExploredCategories>(
    addExploredCategoryID
);
export const selectCategoryAction = createActionCreator(selectCategoryID);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/logging/LoggingActions.ts