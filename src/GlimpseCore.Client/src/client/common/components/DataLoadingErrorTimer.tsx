import React from 'react';

import DataLoadingTimer from './DataLoadingTimer';

interface IRequestsDataLoadingTimerProps {
    className?: string;
    isDataLoaded: boolean;
    isError: boolean;
    isErrorBeforeTimeout?: boolean;
    getLoadingStatusBlock: () => JSX.Element | string;
    getEmptyStatusBlock: () => JSX.Element | string;
    getErrorStatusBlock: () => JSX.Element | string;
}

interface IRequestsDataLoadingTimerState {
    isTimeoutElapsed: boolean;
}

/* `DataLoadingErrorTimer` component extends `DataLoadingTimer` and implements
    one more state - the `error state`.

    *(please see `DataLoadingTimer.tsx` for states reference)*

    4. `Error state` - shows up when `timer elapsed`, `data is present` but
        there is some error in the data or the data doesn't meet expectations.

    Example:
        Let's say we have a list of data and a component that renders this list.
        On top of `empty` and `loading` states that we can have
        with `DataLoadingTimer`, want to be sure that if data is loaded,
        it contains at least 20 items. If this expectation is not met, we will
        wait until timeout is elapsed in hope that expected data will be loaded
        only after the timeout we can finally show the error.

        ```typescript
            const list = [...];
            return (
                <DataLoadingErrorTimer isDataLoaded={list.length > 0}
                    isError={list.length < 20}
                    getErrorStatusBlock={this.renderError}>

                    <ComponentThatRendersSomeList list={list} />
                </DataLoadingErrorTimer>
            );
        ```

        `getErrorStatusBlock` consumes a function that should return
        a `string` or `JSX tree` when called.
*/
export default class DataLoadingErrorTimer extends React.Component<
    IRequestsDataLoadingTimerProps,
    IRequestsDataLoadingTimerState
> {
    public static defaultProps = {
        getErrorStatusBlock: () => {
            return 'Error.';
        },
        isErrorBeforeTimeout: false
    };

    /**
     * Constructor only to set up initial state.
     */
    constructor(props) {
        super(props);
        this.state = {
            isTimeoutElapsed: false
        };
    }

    /**
     * Callback to change state when timeout elapsed.
     */
    private onTimeoutElapsed = (): void => {
        this.setState({
            isTimeoutElapsed: true
        });
    };

    public render(): JSX.Element {
        const {
            className,
            children,
            isDataLoaded,
            getLoadingStatusBlock,
            getEmptyStatusBlock,
            isError
        } = this.props;

        return (
            <DataLoadingTimer
                className={className}
                isDataLoaded={isDataLoaded}
                getLoadingStatusBlock={getLoadingStatusBlock}
                getEmptyStatusBlock={getEmptyStatusBlock}
                onTimeoutElapsed={this.onTimeoutElapsed}>
                {// if there is some data and no error - show `children`
                // otherwise handle the error
                !isError ? children : this.handleErrorCase()}
            </DataLoadingTimer>
        );
    }

    /**
     * Function to handle the case when data loaded
     * and `isError` has been risen.
     */
    private handleErrorCase(): JSX.Element | string {
        const { isErrorBeforeTimeout, getErrorStatusBlock, getLoadingStatusBlock } = this.props;

        // error matters only when timeout elapsed - show `loading` until
        // `isTimeoutElapsed` is set, then show the `error block`.
        // but if `isErrorBeforeTimeout` is set - show the `error block`
        // even before timeout elapsed.
        return this.state.isTimeoutElapsed || isErrorBeforeTimeout
            ? getErrorStatusBlock()
            : getLoadingStatusBlock();
    }
}



// WEBPACK FOOTER //
// ./src/client/common/components/DataLoadingErrorTimer.tsx