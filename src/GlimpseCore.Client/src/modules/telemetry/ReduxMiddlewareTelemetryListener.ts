import { IStoreState } from '@client/IStoreState';
import {
    getDataTabMeasurements,
    getDataTabProperties,
    getLoggingTabMeasurements,
    getRequestHeaderTelemetryProperties,
    getResponseHeaderTelemetryProperties,
    getRequestHeaderTelemetryMeasurements,
    getResponseHeaderTelemetryMeasurements,
    getMiddlewareTelemetryMeasurements,
    getMiddlewareTelemetryMaxDepth,
    getMiddlewareTelemetryProperties,
    getTimelineTabMeasurements,
    getServicesTabMeasurements
} from './TelemetrySelectors';
import { DATA_TAB_NAME } from '@routes/requests/details/data/DataConfig';
import { SERVICE_TAB_NAME } from '@routes/requests/details/service/ServiceConstants';
import telemetryClient from './TelemetryClient';
import { IMeasurements, IProperties } from '@modules/telemetry/TelemetryInterfaces';
import { applyFilterStateAction } from '@client/routes/requests/RequestsFilterActions';
import { getExcludedContentTypeClassNames } from '@common/util/ContentTypes';

/**
 *  Properties sent when a request detail is selected
 */
interface IRequestDetailSelectedProperties extends IProperties {
    /** ID of the current request */
    currentRequestId: string;

    /** ID of the next request */
    nextRequestId: string;

    /** Name of the current tab being viewed. */
    currentTabName: string;

    /** Name of the previous tab being viewed. */
    nextTabName: string;

    /** HTTP method of the request being viewed. */
    method: string;

    /** protocol scheme of the request being viewed. */
    protocol: string;
}

/**
 * Measurements sent on RequestDetailSelected event.
 */
interface IRequestDetailSelectedMeasurements extends IMeasurements {
    /** number of milliseconds spent viewing the curent request before we switch to the next request */
    currentRequestViewTimeMillis: number;

    /** number of milliseconds spent viewing the previous tab before we switch to the next request */
    currentTabViewTimeMillis: number;

    /** status code of the request being viewed */
    statusCode: number;

    /** urlLength of the request being viewed */
    urlLength: number;

    /** request header length of the request being viewed */
    requestHeaderLength: number;

    /** response header length of the request being viewed */
    responseHeaderLength: number;
}

/**
 * Properties sent  when user closes a request detail view.
 */
interface IRequestDetailClosedProperties extends IProperties {
    /**  request ID when the request details tab closed */
    currentRequestId: string;

    /** tab name in use when the request details tab closed */
    currentTabName: string;
}

/**
 * Measurements sent when user closes a request detail view.
 */
interface IRequestDetailClosedMeasurements extends IMeasurements {
    /** number of milliseconds spent viewing the currently viewed request */
    currentRequestViewTimeMillis: number;

    /** number of milliseconds spent viewing the currently viewed tab */
    currentTabViewTimeMillis: number;
}

/**
 * Properties sent when user changes tab being viewed for a request.
 */
interface IRequestDetailTabChangedProperties extends IProperties {
    /**  current request ID when the tab changes */
    currentRequestId: string;

    /** Name of the next  tab to be viewed. */
    nextTabName: string;

    /** Name of the current tab being viewed. */
    currentTabName: string;
}

/**
 * Measurements sent on RequestDetailTabChanged
 */
interface IRequestDetailTabChangedMeasurements extends IMeasurements {
    /** number of milliseconds spent viewing the current tab */
    currentTabViewTimeMillis: number;
}

/**
 * Properties sent when user changes the requests filters
 */
interface IRequestsFiltersProperties extends IProperties {
    methods: string;
    statusCodes: string;
    contentTypeClasses: string;
}

/**
 * Class responsible for sending telemetry events.  It will register to be notified on various shell events
 * and send telemetry events through app insights when those events occur.
 *
 * Microsoft values privacy.  For details, please see our privacy
 * statement at http://go.microsoft.com/fwlink/?LinkId=521839&CLCID=0409.
 *
 */
class ReduxMiddlewareTelemetryListener {
    private static requestDetailSelected = 'RequestDetailSelected';
    private static requestDetailClosed = 'RequestDetailClosed';
    private static requestDetailTabChanged = 'RequestDetailTabChanged';
    private static requestFiltersChanged = 'RequestFiltersChanged';
    private static defaultTab = '';

    private currentRequestId: string = '';
    private lastRequestChangeTime: number;
    private currentTab: string = '';
    private lastTabChangeTime: number;

    /**
     * update lastRequestChangeTime & return delta (in milliseconds) between current time & previous time
     */
    private markLastRequestViewMillis(): number {
        const nextEventTime = window.performance.now();
        let elapsed = 0;
        if (this.lastRequestChangeTime) {
            elapsed = nextEventTime - this.lastRequestChangeTime;
        }
        this.lastRequestChangeTime = nextEventTime;
        return elapsed;
    }

    /**
     * update lastTabChangeTime & return delta (in milliseconds) between current time & previous time
     */
    private markLastTabViewMillis(): number {
        const nextEventTime = window.performance.now();
        let elapsed = 0;
        if (this.lastTabChangeTime) {
            elapsed = nextEventTime - this.lastTabChangeTime;
        }
        this.lastTabChangeTime = nextEventTime;
        return elapsed;
    }

    /**
     * retrieve the RequestDetailSelected properties.
     */
    private getRequestDetailSelectedProperties(
        nextRequestId: string,
        currentRequestId: string,
        nextTabName: string,
        currentTabName: string,
        webRequest,
        webResponse,
        currentRequestValid: boolean,
        state: IStoreState
    ): IRequestDetailSelectedProperties {
        const props: IRequestDetailSelectedProperties = {
            currentRequestId,
            nextRequestId,
            currentTabName,
            nextTabName,
            method: undefined,
            protocol: undefined,
            currentRequestValid: `${currentRequestValid}`
        };

        if (webRequest && webResponse) {
            props.method = webRequest.method;
            props.protocol = webRequest.protocol && webRequest.protocol.identifier;
        }

        if (currentRequestValid) {
            Object.assign(props, this.getCustomTabProperties(currentTabName, state));
        }

        return props;
    }

    /**
     * retrieve the RequestDetailSelected measurements.
     */
    private getRequestDetailSelectedMeasurements(
        tabName: string,
        currentRequestViewTimeMillis: number,
        currentTabViewTimeMillis: number,
        webRequest,
        webResponse,
        currentRequestValid: boolean,
        state: IStoreState
    ): IRequestDetailSelectedMeasurements {
        const props: IRequestDetailSelectedMeasurements = {
            currentRequestViewTimeMillis,
            currentTabViewTimeMillis,
            statusCode: undefined,
            urlLength: undefined,
            requestHeaderLength: undefined,
            responseHeaderLength: undefined
        };

        if (webRequest && webResponse) {
            props.statusCode = webResponse.statusCode;
            props.urlLength = webRequest.url && webRequest.url.length;
            props.requestHeaderLength =
                webRequest.headers && Object.keys(webRequest.headers).length;
            props.responseHeaderLength =
                webResponse.headers && Object.keys(webResponse.headers).length;
        }

        if (currentRequestValid) {
            Object.assign(props, this.getCustomTabMeasurements(tabName, state));
        }

        return props;
    }

    /**
     * Retrieve RequestDetailClosed properties.
     */
    private getRequestDetailClosedProperties(): IRequestDetailClosedProperties {
        const props: IRequestDetailClosedProperties = {
            currentRequestId: this.currentRequestId,
            currentTabName: this.currentTab
        };
        return props;
    }

    /**
     * Retrieve RequestDetailClosed measurements.
     */
    private getRequestDetailClosedMeasurements(
        currentRequestViewTimeMillis,
        currentTabViewTimeMillis
    ): IRequestDetailClosedMeasurements {
        const props: IRequestDetailClosedMeasurements = {
            currentRequestViewTimeMillis,
            currentTabViewTimeMillis
        };
        return props;
    }

    /**
     * Retrieve RequestDetailTabChanged properties.
     */
    private getRequestDetailTabChangedProperties(
        nextTabName,
        currentTabName,
        state: IStoreState
    ): IRequestDetailTabChangedProperties {
        const props: IRequestDetailTabChangedProperties = {
            currentRequestId: this.currentRequestId,
            nextTabName,
            currentTabName
        };

        Object.assign(props, this.getCustomTabProperties(currentTabName, state));

        return props;
    }

    /**
     * Retrieve RequestDetailTabChanged measurements.
     */
    private getRequestDetailTabChangedMeasurements(
        tabName: string,
        currentTabViewTimeMillis: number,
        state: IStoreState
    ): IRequestDetailTabChangedMeasurements {
        const props: IRequestDetailTabChangedMeasurements = {
            currentTabViewTimeMillis
        };

        Object.assign(props, this.getCustomTabMeasurements(tabName, state));

        return props;
    }

    private getCustomTabProperties(tabName, state: IStoreState): IProperties {
        // short term - add appropriate logic in here to get stats for other tabs
        // long term - figure out best way for tabs to register a callback(s) here so we can get per-tab custom measurements.
        if (tabName === 'request') {
            const p1 = getRequestHeaderTelemetryProperties(state);
            const p2 = getResponseHeaderTelemetryProperties(state);
            const p3 = getMiddlewareTelemetryProperties(state);
            return { ...p1, ...p2, ...p3 };
        } else if (tabName === DATA_TAB_NAME) {
            const props = getDataTabProperties(state);
            return props;
        } else {
            return {};
        }
    }

    /**
     * get custom tab measurements for the current tab.
     */
    private getCustomTabMeasurements(tabName, state: IStoreState): IMeasurements {
        // short term - add appropriate logic in here to get stats for other tabs
        // long term - figure out best way for tabs to register a callback(s) here so we can get per-tab custom measurements.
        if (tabName === 'log') {
            const result = getLoggingTabMeasurements(state);
            return result;
        } else if (tabName === 'request') {
            const p1 = getRequestHeaderTelemetryMeasurements(state);
            const p2 = getResponseHeaderTelemetryMeasurements(state);
            const p3 = getMiddlewareTelemetryMeasurements(state);
            const p4 = getMiddlewareTelemetryMaxDepth(state);
            return Object.assign({}, p1, p2, p3, p4);
        } else if (tabName === 'timeline') {
            const props = getTimelineTabMeasurements(state);
            return props;
        } else if (tabName === SERVICE_TAB_NAME) {
            const props = getServicesTabMeasurements(state);
            return props;
        } else if (tabName === DATA_TAB_NAME) {
            const props = getDataTabMeasurements(state);
            return props;
        } else {
            return {};
        }
    }

    /**
     * create redux middlware that will send telemetry for different actions
     */
    public createTelemetryMiddleware() {
        const telemetryMiddleware = store => next => action => {
            const returnValue = next(action);

            try {
                const state: IStoreState = store.getState();

                switch (action.type) {
                    case 'REQUESTS_DETAILS_SELECTED':
                        {
                            // telemetry sent when a request detail is selected
                            if (!this.currentTab) {
                                this.currentTab = ReduxMiddlewareTelemetryListener.defaultTab;
                            }

                            const { webRequest, webResponse } = action;
                            const properties = this.getRequestDetailSelectedProperties(
                                action.requestId,
                                this.currentRequestId,
                                this.currentTab,
                                this.currentTab,
                                webRequest,
                                webResponse,
                                action.previousRequestValid,
                                state
                            );
                            let measurements = this.getRequestDetailSelectedMeasurements(
                                this.currentTab,
                                this.markLastRequestViewMillis(),
                                this.markLastTabViewMillis(),
                                webRequest,
                                webResponse,
                                action.previousRequestValid,
                                state
                            );
                            this.currentRequestId = action.requestId;
                            telemetryClient.sendEvent(
                                ReduxMiddlewareTelemetryListener.requestDetailSelected,
                                properties,
                                measurements
                            );
                        }
                        break;

                    case 'REQUESTS_DETAILS_CLOSED':
                        {
                            // telemetry sent when a request detail is closed

                            //
                            // TODO - wire this up so the event is emitted!!!
                            //
                            const properties = this.getRequestDetailClosedProperties();
                            const measurements = this.getRequestDetailClosedMeasurements(
                                this.markLastRequestViewMillis(),
                                this.markLastTabViewMillis()
                            );
                            telemetryClient.sendEvent(
                                ReduxMiddlewareTelemetryListener.requestDetailClosed,
                                properties,
                                measurements
                            );
                            this.lastRequestChangeTime = undefined;
                            this.lastTabChangeTime = undefined;
                            this.currentRequestId = undefined;
                            this.currentTab = undefined;
                        }
                        break;

                    case 'REQUESTS_DETAILS_TAB_SELECTED':
                        {
                            // telemetry sent when a tab changes in a request detail page
                            const properties = this.getRequestDetailTabChangedProperties(
                                action.target,
                                this.currentTab,
                                state
                            );
                            const measurements = this.getRequestDetailTabChangedMeasurements(
                                this.currentTab,
                                this.markLastTabViewMillis(),
                                state
                            );
                            telemetryClient.sendEvent(
                                ReduxMiddlewareTelemetryListener.requestDetailTabChanged,
                                properties,
                                measurements
                            );
                            this.currentTab = action.target;
                        }
                        break;

                    case applyFilterStateAction.type:
                        {
                            const { payload } = action;
                            const delimiter = ',';

                            const requestsFiltersProperties: IRequestsFiltersProperties = {
                                methods: Object.keys(payload.method).join(delimiter),
                                statusCodes: Object.keys(payload.status).join(delimiter),
                                contentTypeClasses: getExcludedContentTypeClassNames(
                                    payload.contentTypeClass
                                ).join(delimiter)
                            };

                            telemetryClient.sendEvent(
                                ReduxMiddlewareTelemetryListener.requestFiltersChanged,
                                requestsFiltersProperties
                            );
                        }
                        break;

                    default:
                        break;
                }
            } catch (err) {
                // error sending telemetry.  Just swallow it.
                console.error(err);
            }

            return returnValue;
        };

        return telemetryMiddleware;
    }
}

let reduxMiddlewareTelemetryListener = new ReduxMiddlewareTelemetryListener();
export default reduxMiddlewareTelemetryListener;



// WEBPACK FOOTER //
// ./src/client/modules/telemetry/ReduxMiddlewareTelemetryListener.ts