import React from 'react';
import * as ReactRouter from 'react-router';
import classNames from 'classnames';

import { requestConfig, responseConfig } from '../RequestTabStripConfig';

import styles from './Request.scss';
import commonStyles from '@common/components/Common.scss';

import RequestMiddlewareView from './RequestMiddleware';
import RequestResource from './RequestResource';
import RequestResponseTabStripView from '@routes/requests/details/components/request-response-tab-strip/views/RequestResponseTabStrip';

// TODO: detailAxis will probably go away... can probably derive it

interface IRequestTabProps extends ReactRouter.RouteComponentProps<{}, {}> {}

export class RequestTab extends React.Component<IRequestTabProps, {}> {
    public render() {
        const { location } = this.props;
        const requestAxis = location.query['requestAxis']; // tslint:disable-line:no-string-literal
        const responseAxis = location.query['responseAxis']; // tslint:disable-line:no-string-literal

        return (
            <div className={styles.view}>
                <div className={commonStyles.contextSection}>
                    <RequestResponseTabStripView
                        requestConfig={requestConfig}
                        responseConfig={responseConfig}
                        detailAxis="request"
                        requestAxis={requestAxis}
                        responseAxis={responseAxis}
                    />
                </div>
                <div className={commonStyles.contextSection}>
                    <RequestMiddlewareView />
                </div>
                <div
                    className={classNames(
                        commonStyles.contextSection,
                        commonStyles.contextSectionEnd
                    )}>
                    <RequestResource />
                </div>
            </div>
        );
    }
}

export default RequestTab;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/request/views/Request.tsx