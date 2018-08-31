import { current as currentMetadata } from '@modules/metadata/MetadataActions';
import { AppInsights } from 'applicationinsights-js';
import { IProperties, IMeasurements } from './TelemetryInterfaces';
import * as uuid from 'uuid';

/**
 * Shape of the IClientTelemetryInfo message returned from the server.
 * See definition in Glimpse.Node repo  at src/glimpse.server/resources/TelemetryConfigResource.ts.
 */
export interface IClientTelemetryInfo {
    /** IP address of the glimpse client as observed by the glimpse server */
    clientIP: string;

    /** session ID of the server */
    serverSessionId: string;

    /** flag indicating if sending telemetry from client is enabled or disabled. */
    enabled: boolean;

    /** Application Insights instrumentation key */
    instrumentationKey: string;

    /** Application Insights endpoint URI for sending telemetry */
    uri: string;

    /** link to Microsoft privacy Policy. */
    privacyPolicy: string;

    /** serverGlimpseVersion */
    serverGlimpseVersion: string;

    /** unique ID for the machine hosting the server.  This is a SHA256 hash of the machine's mac address. */
    serverMachineId: string;

    /** name of the application hosting the glimpse.server */
    serverAppName: string;

    /** OS Platform where server is running */
    serverOSPlatform: string;

    /** OS Release where server is running */
    serverOSRelease: string;

    /** OS Type where server is running */
    serverOSType: string;

    /** version of the runtime where the server is running */
    serverRuntimeVersion: string;

    /** name of the runtime where the server is running */
    serverRuntimeName: string;
}

/**
 * Common properties shared by all events passed to app insights
 */
interface ICommonProperties extends IProperties {
    /** unique identifier for this instance of the glimpse client. */
    sessionId: string;
}

/**
 * properties sent on ShellReady event.
 */
interface IShellReadyProperties extends ICommonProperties {
    /** version of the glimpse server */
    glimpseServerVersion: string;

    /** version of the glimpse client */
    glimpseClientVersion: string;

    /** version of the glimpse hud */
    glimpseHUDVersion: string;

    /** version of the glimpse browser agent */
    glimpseBrowserAgentVersion: string;

    /** semi-colon seperated list of glimpse agent versions */
    glimpseAgentVersion: string;

    /** unique identifier for the machine where the glimpser.server is running. */
    serverMachineId: string;

    /** app name where server is running, as returned from the TelemetryConfigResource. */
    serverAppName: string;

    /** OS platform where server is running, as returned from the TelemetryConfigResource. */
    serverOSPlatform: string;

    /** OS Release where server is running, as returned from the TelemetryConfigResource. */
    serverOSRelease: string;

    /** OS Type where server is running, as returned from the TelemetryConfigResource. */
    serverOSType: string;

    /** this client's IP address as observed by the glimpse server. */
    clientIP: string;

    /** unique identifier for this client stored in a browser cookie. */
    clientCookieID: string;

    /** boolean string value, 'true' indicates this is an development build, anyy other value indicates it is a released build */
    isDevelopmentBuild: string;

    /** session ID of the server */
    serverSessionId: string;

    /** navigator.language value */
    navigatorLanguage: string;

    /** navigator.languages value */
    navigatorLanguages: string;

    /** navigator.oscpu value */
    navigatorOSCPU: string;
}

interface IShellReadyMeasurements extends IMeasurements {
    /** screen height in pixes */
    screenHeight: number;

    /** screen width in pixes */
    screenWidth: number;

    /** window height in pixes */
    windowHeight: number;

    /** window width in pixes */
    windowWidth: number;

    /** top-left most position of the window */
    leftPosition: number;
}

/**
 * Shape of object defining
 */
interface ITelemetryEvent {
    name: string;
    properties: ICommonProperties; // map string->string
    measurements: IMeasurements; // map string->number
}

/**
 * Class responsible for sending telemetry events.  It will register to be notified on various shell events
 * and send telemetry events through app insights when those events occur.
 *
 * Microsoft values privacy.  For details, please see our privacy
 * statement at http://go.microsoft.com/fwlink/?LinkId=521839&CLCID=0409.
 *
 */
class TelemetryClient {
    private static shellReady = 'ShellReady';

    // telemetry configuration details retrieved from the glimpse server.  This is populated asynchronously, so there's logic to
    // account for events sent before & after telemetryConfig is available.
    private telemetryConfig: IClientTelemetryInfo;

    // telemetry enabled defaults to true, value will be reset when we receive the telemetryConfig.
    private isTelemetryEnabled = true;
    private sessionId: string;
    private clientCookieId: string;
    private glimpseClientVersion: string;
    private glimpseHUDVersion: string;
    private glimpseBrowserAgentVersion: string;
    private glimpseServerVersion: string;
    private glimpseAgentVersion: string;

    // we'll queue telemetry events until the telemetry config is downloaded and app insights is configured.
    private eventQueue: ITelemetryEvent[] = [];

    constructor() {
        this.glimpseClientVersion = '0.0';
        this.glimpseHUDVersion = '0.0';
        this.glimpseBrowserAgentVersion = '0.0';

        this.sessionId = uuid.v4();
        this.setupClientCookieId();

        currentMetadata(metadata => {
            if (metadata.versions) {
                /*tslint:disable:no-string-literal */
                this.glimpseClientVersion = metadata.versions['client'];
                this.glimpseHUDVersion = metadata.versions['hud'];
                this.glimpseBrowserAgentVersion = metadata.versions['browserAgent'];
                this.glimpseAgentVersion = metadata.versions['@glimpse/glimpse-node-agent'];
                this.glimpseServerVersion = metadata.versions['@glimpse/glimpse-node-server'];
                /*tslint:enable:no-string-literal */
            }

            if (!metadata.resources || !metadata.resources['telemetry-config']) {
                this.isTelemetryEnabled = false;
            } else {
                //tslint:disable-next-line:no-any
                const uri = (<any>metadata.resources['telemetry-config']).fill({});
                // look up telemetry config
                fetch(uri)
                    .then<IClientTelemetryInfo>(response => {
                        return response.json();
                    })
                    .then(telemetryConfig => {
                        this.telemetryConfig = telemetryConfig;
                        this.configure(telemetryConfig);
                    })
                    .catch(err => {
                        console.error('Glimpse telemetry config could not be obtained: ' + err);
                    });
            }
        });
    }

    /**
     * Send a telemetry event
     */
    public sendEvent(name: string, properties: IProperties, measurements?: IMeasurements): void {
        const commonProps: ICommonProperties = {
            sessionId: this.sessionId,
            ...properties
        };
        this.queueOrSendEvent(name, commonProps, measurements);
    }

    /**
     * configure telemetry client
     */
    private configure(telemetryConfig) {
        this.isTelemetryEnabled = PRODUCTION && telemetryConfig && telemetryConfig.enabled
            ? telemetryConfig.enabled
            : false;
        if (!this.isTelemetryEnabled) {
            // shouldn't need this any longer
            this.eventQueue = undefined;
        } else {
            // Call downloadAndSetup to download full ApplicationInsights script from CDN and initialize it with instrumentation key.
            AppInsights.downloadAndSetup({
                instrumentationKey: telemetryConfig.instrumentationKey,
                endpointUrl: telemetryConfig.uri,
                emitLineDelimitedJson: true
            });

            // Add telemetry initializer to enable user tracking
            // TODO:  verify this works
            AppInsights.queue.push(function() {
                AppInsights.context.addTelemetryInitializer(function(envelope) {
                    if (window.navigator && window.navigator.userAgent) {
                        envelope.tags['ai.user.userAgent'] = window.navigator.userAgent;
                    }
                    return true;
                });
            });

            // now that we have the telemetry config, send any queued events
            while (this.eventQueue.length > 0) {
                const event = this.eventQueue.shift();

                // back-fill any property data available from the telemetryConfig
                if (event.name === TelemetryClient.shellReady) {
                    this.getShellReadyProperties(<IShellReadyProperties>event.properties);
                }

                // send event through app insights API
                AppInsights.trackEvent(event.name, event.properties, event.measurements);
            }
        }
    }

    /**
     * read client ID from cookie, or generate a new ID & store it in a cookie.
     */
    private setupClientCookieId() {
        // TODO:  when we move to new client, implement this.
        this.clientCookieId = 'TODO';
    }

    /**
     * send an event (if app insights is currently configured), or queue it for sending later when app insights is configured.
     */
    private queueOrSendEvent(
        name: string,
        properties: ICommonProperties,
        measurements: IMeasurements
    ) {
        if (this.isTelemetryEnabled) {
            if (!this.telemetryConfig) {
                this.eventQueue.push({ name, properties, measurements });
            } else {
                AppInsights.trackEvent(name, properties, measurements);
            }
        }
    }

    /**
     * Retrieve shell-ready properties (if telemetry config is available).  If a set of props is passed in,
     * then the specified props will be updated.  Otherwise, a new instance will returned.
     */
    private getShellReadyProperties(props?: IShellReadyProperties): IShellReadyProperties {
        if (!props) {
            const p: IShellReadyProperties = {
                sessionId: undefined,
                clientCookieID: undefined,
                glimpseClientVersion: undefined,
                glimpseHUDVersion: undefined,
                glimpseBrowserAgentVersion: undefined,
                glimpseServerVersion: undefined,
                glimpseAgentVersion: undefined,
                serverMachineId: undefined,
                serverAppName: undefined,
                serverOSPlatform: undefined,
                serverOSRelease: undefined,
                serverOSType: undefined,
                clientIP: undefined,
                isDevelopmentBuild: undefined,
                serverSessionId: undefined,
                navigatorLanguage: undefined,
                navigatorLanguages: undefined,
                navigatorOSCPU: undefined
            };
            props = p;
        }

        props.sessionId = this.sessionId;
        props.clientCookieID = this.clientCookieId;
        props.isDevelopmentBuild = !PRODUCTION ? 'true' : 'false';
        props.glimpseClientVersion = this.glimpseClientVersion;
        props.glimpseHUDVersion = this.glimpseHUDVersion;
        props.glimpseBrowserAgentVersion = this.glimpseBrowserAgentVersion;
        props.glimpseAgentVersion = this.glimpseAgentVersion;
        props.glimpseServerVersion = this.glimpseServerVersion;

        if (this.telemetryConfig) {
            props.serverMachineId = this.telemetryConfig.serverMachineId;
            props.serverAppName = this.telemetryConfig.serverAppName;
            props.serverOSPlatform = this.telemetryConfig.serverOSPlatform;
            props.serverOSRelease = this.telemetryConfig.serverOSRelease;
            props.serverOSType = this.telemetryConfig.serverOSType;
            props.clientIP = this.telemetryConfig.clientIP;
            props.serverSessionId = this.telemetryConfig.serverSessionId;
        }

        // add navigator cultural data
        const nav = navigator as any; // tslint:disable-line:no-any
        props.navigatorLanguage = nav.language;
        props.navigatorOSCPU = nav.oscpu;
        if (nav.languages && nav.languages.join) {
            props.languages = nav.languages.join(', ');
        }

        return props;
    }

    private getShellReadyMeasurements(): IShellReadyMeasurements {
        const props: IShellReadyMeasurements = {
            screenHeight: screen.height,
            screenWidth: screen.width,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            leftPosition: window.screenLeft || window.screenX
        };
        return props;
    }

    /**
     * create redux middlware that will send telemetry for different actions
     */
    public createTelemetryMiddleware() {
        const telemetryMiddleware = store => next => action => {
            const returnValue = next(action);

            try {
                if (action.type === 'SHELL_LOADED') {
                    // telemetry sent when client UI is first opened
                    const properties = this.getShellReadyProperties();
                    const measurements = this.getShellReadyMeasurements();
                    this.queueOrSendEvent(TelemetryClient.shellReady, properties, measurements);
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

let telemetryClient = new TelemetryClient();
export default telemetryClient;



// WEBPACK FOOTER //
// ./src/client/modules/telemetry/TelemetryClient.ts