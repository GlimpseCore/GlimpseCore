import React from 'react';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';

import styles from './RequestResource.scss';
import commonStyles from '@common/components/Common.scss';

import { getBrowserResourceTypeData } from '../RequestResourceSelectors';
import RequestResourceTable from './RequestResourceTable';
import { IStoreState } from '@client/IStoreState';

interface IRequestResourceProps {
    counts: { [key: string]: number };
    sizes: { [key: string]: number };
    durations: { [key: string]: number };
}

export class RequestResource extends React.Component<IRequestResourceProps, {}> {
    public render() {
        const { counts, durations, sizes } = this.props;

        if (isEmpty(counts) && isEmpty(durations) && isEmpty(sizes)) {
            return null; /* tslint:disable-line:no-null-keyword */
        }

        return (
            <div>
                <h3 className={commonStyles.detailTitle}>Resources</h3>
                <div className={styles.requestResource}>
                    <RequestResourceTable
                        className={styles.requestResourceTableContainer}
                        values={counts}
                        valueHeader="Count"
                        labelHeader="Resource"
                        fixedPoints={0}
                    />
                    <RequestResourceTable
                        className={styles.requestResourceTableContainer}
                        values={durations}
                        valueHeader="Duration (ms)"
                        labelHeader="Resource"
                        fixedPoints={2}
                    />
                    <RequestResourceTable
                        className={styles.requestResourceTableContainer}
                        values={sizes}
                        valueHeader="Bytes"
                        labelHeader="Resource"
                        fixedPoints={0}
                    />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: IStoreState): IRequestResourceProps {
    return getBrowserResourceTypeData(state);
}

export default connect(mapStateToProps)(RequestResource);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/request/views/RequestResource.tsx