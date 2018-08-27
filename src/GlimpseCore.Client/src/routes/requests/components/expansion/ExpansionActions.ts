import { createRequestPersistedActionCreator } from '@common/actions/ActionCreator';
import { EXPANSION_SET } from './ExpansionConstants';
import { ExpandedState } from './IExpansionPersistedState';

export interface ISetExpansionActionPayload {
    /**
     * The ID of the request associated with the element.
     */
    requestId: string;

    /**
     * The unique ID that represents the element.
     *
     * An ID is a list of hierarchal "paths" that identifies the element (e.g. ['root', 'nested']).
     */
    elementId: string[];

    /**
     * The new expanded state of the element.
     */
    expanded: ExpandedState;
}

export const setExpansionAction = createRequestPersistedActionCreator<ISetExpansionActionPayload>(
    EXPANSION_SET
);

export const expandAction = (requestId: string, elementId: string[]) =>
    setExpansionAction({
        requestId,
        elementId,
        expanded: ExpandedState.Expanded
    });
export const expandAllAction = (requestId: string, elementId: string[]) =>
    setExpansionAction({
        requestId,
        elementId,
        expanded: ExpandedState.ExpandAll
    });
export const collapseAction = (requestId: string, elementId: string[]) =>
    setExpansionAction({
        requestId,
        elementId,
        expanded: ExpandedState.Collapsed
    });
export const collapseAllAction = (requestId: string, elementId: string[]) =>
    setExpansionAction({
        requestId,
        elementId,
        expanded: ExpandedState.CollapseAll
    });



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/expansion/ExpansionActions.ts