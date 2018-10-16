import DebugView from './DebugView';

export default {
    getTabData() {
        return {
            title: '__Debug__',
            getUrl: data => `/requests/${data.requestId}/debug`
        };
    },
    getRoute() {
        return {
            path: 'debug',
            component: DebugView
        };
    }
};



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/debug/DebugConfig.ts