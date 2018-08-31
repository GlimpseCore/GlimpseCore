import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import React from 'react';

import { trainCase } from '@common/util/StringUtilities';

import styles from './HeadersView.scss';
import commonStyles from '@common/components/Common.scss';
import {
    FixedWidthLeftColumnTable,
    nameValueColumns
} from '@common/components/FixedWidthLeftColumnTable';
import { InformationLabel } from '@common/components/InformationLabel';

export interface IHeadersProps {
    headers: {
        [key: string]: string[];
    };
    isSecurityRestricted: boolean;
}

export class HeadersView extends React.Component<IHeadersProps, {}> {
    public render() {
        const { headers } = this.props;

        return (
            <div className={styles.headers}>
                {this.renderSecurityRestricted()}
                {isEmpty(headers) ? this.renderNone() : this.renderTable(headers)}
            </div>
        );
    }

    private renderNone() {
        return <div className={commonStyles.noData}>No headers found</div>;
    }

    private renderSecurityRestricted() {
        const { isSecurityRestricted } = this.props;

        if (isSecurityRestricted) {
            return (
                <InformationLabel
                    text="Incomplete headers list due to browser security restrictions."
                    textClassName={styles.contentMessage}
                />
            );
        }
    }

    private renderTable(headers: { [key: string]: string[] }) {
        const flattenedHeaders = map(headers, (value: string[], key: string) => ({
            name: trainCase(key),
            value: value
        }))
            .map(pair => pair.value.map(value => ({ name: pair.name, value: value })))
            .reduce((mappedHeaders, header) => mappedHeaders.concat(header), []);

        const sortedHeaders = sortBy(flattenedHeaders, param => param.name);

        return (
            <FixedWidthLeftColumnTable
                className={styles.headersTable}
                columns={nameValueColumns}
                params={sortedHeaders}
            />
        );
    }
}

export default HeadersView;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/headers/HeadersView.tsx