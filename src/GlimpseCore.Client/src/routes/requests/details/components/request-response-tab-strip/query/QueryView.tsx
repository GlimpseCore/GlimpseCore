import isEmpty from 'lodash/isEmpty';
import React from 'react';

import styles from './QueryView.scss';
import commonStyles from 'common/components/Common.scss';
import { ParameterList } from 'common/components/ParameterList';

export interface IQueryViewProps {
    queryParams: { [key: string]: string | string[] };
}

export class QueryView extends React.Component<IQueryViewProps, {}> {
    public render() {
        const { queryParams } = this.props;

        return (
            <div className={styles.query}>
                {isEmpty(queryParams) ? this.renderNone() : this.renderList(queryParams)}
            </div>
        );
    }

    private renderNone() {
        return <div className={commonStyles.noData}>No query parameters found</div>;
    }

    private renderList(params: { [key: string]: string | string[] }) {
        return <ParameterList className={styles.queryTable} params={params} />;
    }
}

export default QueryView;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/query/QueryView.tsx