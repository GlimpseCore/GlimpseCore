import Timeline from './views/Timeline';

export default {
    getTabData() {
        return {
            title: 'Timeline',
            getUrl: data => `/requests/${data.requestId}/timeline`
        };
    },
    getRoute() {
        return {
            path: 'timeline',
            component: Timeline
        };
    }
};



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/TimelineConfig.ts