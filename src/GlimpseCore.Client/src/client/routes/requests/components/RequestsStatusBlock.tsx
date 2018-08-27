import React from 'react';
import classNames from 'classnames';

import styles from './RequestsStatusBlock.scss';
import DataLoadingErrorTimer from 'common/components/DataLoadingErrorTimer';
import { IRequestFilterDetails } from 'routes/requests/RequestsFilterInterfaces';

interface IRequestsStatusBlockProps {
    className?: string;
    isRequestsDataPresent: boolean;
    isRequestFound?: boolean;
    selectedRequestId?: string | undefined;
    requestFilterDetails?: IRequestFilterDetails;
    emptyText?: string;
    notFoundText?: string;
    filterText?: string;
}

enum Statuses {
    Empty,
    NotFound,
    PleaseSelect
}

export default class RequestsStatusBlock extends React.Component<IRequestsStatusBlockProps, {}> {
    private notFoundBlockFactory: () => JSX.Element;
    private selectBlockFactory: () => JSX.Element;
    private emptyBlockFactory: () => JSX.Element;

    public static defaultProps = {
        isRequestFound: true,
        emptyText: 'Your request list is empty. Try making a request in your app.',
        notFoundText: 'Request not found. Try selecting a different request.',
        filterText:
            'Your request list is empty due to active filters. Reset your filters to see all the requests.'
    };

    constructor(props) {
        super(props);

        // curry factory functions with types
        this.notFoundBlockFactory = this.renderStatusBlock.bind(this, Statuses.NotFound);
        this.selectBlockFactory = this.renderStatusBlock.bind(this, Statuses.PleaseSelect);
        this.emptyBlockFactory = this.renderStatusBlock.bind(this, Statuses.Empty);
    }

    public render() {
        // if we don't expect any `selectedRequestId` and the data is present - say
        // "please select a request" immediately
        const {
            children,
            className,
            selectedRequestId,
            isRequestFound,
            isRequestsDataPresent
        } = this.props;

        const isSelectError = !selectedRequestId && isRequestsDataPresent;

        const errorStatusBlockFactory = !selectedRequestId
            ? this.selectBlockFactory
            : this.notFoundBlockFactory;

        return (
            <DataLoadingErrorTimer
                className={className}
                isDataLoaded={isRequestsDataPresent}
                isError={!isRequestFound || isSelectError}
                isErrorBeforeTimeout={isSelectError}
                getLoadingStatusBlock={this.renderLoading}
                getErrorStatusBlock={errorStatusBlockFactory}
                getEmptyStatusBlock={this.emptyBlockFactory}>
                {children}
            </DataLoadingErrorTimer>
        );
    }

    /*  Function to render `loading` status block.
        @returns {Object} ReactNode.
    */
    private renderLoading(): JSX.Element {
        return (
            <div className={styles.loader}>
                Loading...
                <div className={styles.imagesLoader} />
            </div>
        );
    }

    private renderStatusBlock(type: Statuses): JSX.Element {
        const { requestFilterDetails } = this.props;
        const classModifier = this.getClassModifier(type);
        let statusText: String;

        switch (type) {
            case Statuses.Empty:
                statusText = requestFilterDetails && requestFilterDetails.totalCount > 0
                    ? this.props.filterText
                    : this.props.emptyText;
                break;
            default:
                statusText = this.props.notFoundText;
                break;
        }

        return (
            <div className={classNames(styles.container, classModifier)}>
                <div className={styles.image} />
                <div className={styles.text}>
                    {statusText}
                </div>
            </div>
        );
    }

    private getClassModifier(type: Statuses): string {
        switch (type) {
            case Statuses.Empty:
                return styles.isEmpty;
            case Statuses.PleaseSelect:
                return styles.isSelect;
            default:
                return '';
        }
    }
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/RequestsStatusBlock.tsx