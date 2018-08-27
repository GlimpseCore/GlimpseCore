import Requests from './views/Requests';

import detailConfig from './details/RequestsDetailsConfig';
import { fetch as fetchMessages } from 'modules/messages/MessagesActions';

const path = '/requests';
let hasAlreadyEntered = false;

export default {
    getTabData() {
        return {
            title: 'Requests',
            getUrl: () => path
        };
    },
    getRoute(store) {
        const childRoutes = [detailConfig.getRoute(store)];

        return {
            path,
            childRoutes,
            component: Requests,
            onEnter: () => {
                if (!hasAlreadyEntered) {
                    hasAlreadyEntered = true;
                    store.dispatch(fetchMessages());
                }
            }
        };
    }
};



// WEBPACK FOOTER //
// ./src/client/routes/requests/RequestsConfig.ts