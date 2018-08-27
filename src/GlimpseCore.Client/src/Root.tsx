import omit from 'lodash/omit';
import React from 'react';
import { Provider } from 'react-redux';
import { RedirectFunction, Router, RouterState } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import { baseUrlProperty, browserHistory } from './history';
import { fetch as fetchMetadata, metadataUriProperty } from '@modules/metadata/MetadataActions';

import ShellView from '@shell/views/ShellView';
import { IStoreState } from './IStoreState';

//const exceptionsConfig = require('./routes/exceptions/exceptions-config').default;
//const logsConfig = require('./routes/logs/logs-config').default;
import requestsConfig from './routes/requests/RequestsConfig';

let hasAlreadyEntered = false;

export interface IShellViewProps {
    store;
}

export class Root extends React.Component<IShellViewProps, {}> {
    public render() {
        const { store } = this.props;
        const history = syncHistoryWithStore(browserHistory, store, {
            selectLocationState: (state: IStoreState) => state.session.routing
        });
        const rootRoute = {
            childRoutes: [
                {
                    path: '/',
                    component: ShellView,
                    childRoutes: [
                        //exceptionsConfig.getRoute(store),
                        //logsConfig.getRoute(store),
                        requestsConfig.getRoute(store)
                    ],
                    onEnter(nextState: RouterState, replace: RedirectFunction) {
                        const { location } = nextState;

                        if (
                            location.query[baseUrlProperty] ||
                            location.query[metadataUriProperty]
                        ) {
                            // NOTE: The 'baseUrl' and 'metadataUri' properties are used only to initialize the client.
                            //       We can remove them for the purposes of react-router to simplify the displayed URL.

                            const newQuery = omit(location.query, [
                                baseUrlProperty,
                                metadataUriProperty
                            ]);

                            replace({
                                pathname: location.pathname,
                                query: newQuery
                            });
                        } else if (!hasAlreadyEntered) {
                            hasAlreadyEntered = true;
                            store.dispatch(fetchMetadata());
                        }
                    },
                    indexRoute: {
                        onEnter: (nextState: RouterState, replace: RedirectFunction) => {
                            replace('/requests');
                        }
                    }
                }
            ]
        };

        return (
            <Provider store={store}>
                <Router history={history} routes={rootRoute} />
            </Provider>
        );
    }
}

export default Root;



// WEBPACK FOOTER //
// ./src/client/Root.tsx