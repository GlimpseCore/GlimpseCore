import LoggingContainer from './views/Logging';

export default {
    getTabData() {
        return {
            title: 'Logs',
            getUrl: data => `/requests/${data.requestId}/log`
        };
    },
    getRoute() {
        return {
            path: 'log',
            component: LoggingContainer
        };
    }
};



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/logging/requests-details-logging-config.ts