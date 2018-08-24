import React from 'react';

interface IDataLoadingTimerProps {
    isDataLoaded: boolean;
    className?: string;
    timeout?: number;
    getLoadingStatusBlock?: () => JSX.Element | string;
    getEmptyStatusBlock?: () => JSX.Element | string;
    onTimeoutElapsed?: () => void;
}

interface IDataLoadingTimerState {
    /**
     * Flag determines if timeout elapsed or not.
     */
    isTimeoutElapsed?: boolean;
}

/* `DataLoadingTimer` component intented to be a wrapper around some data that
    should be loaded.

    It has 3 states:
        1. `Loading state` - shows when data wasn't loaded yet
            and timer didn't elapse.
        2. `Empty state` - shows when timeout elapsed and no data was loaded.
        3. `Fulfilled state` - shows `children` if data loaded.

    Example:
        Let's say we have a list of data and a component that renders this list.
        We can have `loading...` and `empty` states around this component by
        wrapping it with `DataLoadingTimer` and setting `isDataLoaded`:

        ```typescript
            const list = [...];
            return (
                <DataLoadingTimer isDataLoaded={list.length > 0}>
                    <ComponentThatRendersSomeList list={list} />
                </DataLoadingTimer>
            );
        ```

    Custom state blocks:
        By using the `getLoadingStatusBlock` and `getEmptyStatusBlock` factory
        function, custom status block could be implemented:

        ```typescript
            const list = [...];
            return (
                <DataLoadingTimer isDataLoaded={list.length > 0}
                    getLoadingStatusBlock={this.renderLoading}
                    getEmptyStatusBlock={this.renderEmpty}>

                    <ComponentThatRendersSomeList list={list} />
                </DataLoadingTimer>
            );
        ```

        The `getLoadingStatusBlock` and `getEmptyStatusBlock` receive
        a function that will return a `string` or `JSX tree`.
*/
export default class DataLoadingTimer extends React.Component<
    IDataLoadingTimerProps,
    IDataLoadingTimerState
> {
    private timerId: number;

    public static defaultProps = {
        className: '',
        timeout: 5000,
        getLoadingStatusBlock: () => {
            return 'Loading...';
        },
        getEmptyStatusBlock: () => {
            return 'Nothing loaded.';
        }
    };

    /**
     *  Constructor only for creating initial state.
     */
    constructor(props) {
        super(props);
        this.state = {
            isTimeoutElapsed: false
        };
    }

    public componentDidMount(): void {
        const { timeout } = this.props;

        this.timerId = window.setTimeout(this.timeoutElapsed, timeout);
    }

    private timeoutElapsed = (): void => {
        if (this.state.isTimeoutElapsed) {
            return;
        }

        this.setState({ isTimeoutElapsed: true }, this.props.onTimeoutElapsed);
    };

    public componentWillUnmount(): void {
        clearTimeout(this.timerId);
    }

    public render(): JSX.Element {
        const { isDataLoaded, children, className } = this.props;

        return (
            <span className={className}>
                {isDataLoaded ? children : this.getStatusBlock()}
            </span>
        );
    }

    private getStatusBlock(): JSX.Element | string {
        const { getEmptyStatusBlock, getLoadingStatusBlock } = this.props;

        return this.state.isTimeoutElapsed ? getEmptyStatusBlock() : getLoadingStatusBlock();
    }
}



// WEBPACK FOOTER //
// ./src/client/common/components/DataLoadingTimer.tsx