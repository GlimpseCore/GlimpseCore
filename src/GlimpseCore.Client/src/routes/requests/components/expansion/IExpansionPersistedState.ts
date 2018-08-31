export enum ExpandedState {
    Expanded,
    ExpandAll,
    Collapsed,
    CollapseAll
}

export interface IExpansionPersistedState {
    /*
     * The current expansion state of an element.
     * 
     * <Undefined>: The element's expansion state is determined by its parent or by the view's default.
     *    Expanded: The element is expanded.
     *   Collapsed: The element is collapsed.
     *   ExpandAll: The element is expanded as well as any child elements whose expanded state is undefined.
     * CollapseAll: The element is collapsed as well as any child elements. 
     */
    expanded?: ExpandedState;

    /*
     * The expansion state of this elements children, keyed by child element's "leaf" (or most specific) ID segment.
     * 
     * E.g. if a parent was element ID ['root', 'parent'] and had two children, ['root', 'parent', 'childA'] and ['root', 'parent', 'childB'],
     *      you would expect to have two elements with keys 'childA' and 'childB'.
     */
    elements: { [key: string]: IExpansionPersistedState };
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/expansion/IExpansionPersistedState.ts