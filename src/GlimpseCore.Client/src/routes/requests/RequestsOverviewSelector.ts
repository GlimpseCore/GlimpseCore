import * as Glimpse from '@_glimpse/glimpse-definitions';

export enum BrowserNavigationTimingSegments {
    PageLoad,
    NetworkConnection,
    SendingRequest,
    ReceivingResponse,
    BrowserProcessing
}

export interface IBrowserNavigationTimingOffsets {
    // can't use BrowserNavigationTiming enum for key type: https://github.com/Microsoft/TypeScript/issues/2491
    [key: string]: {
        duration: number;
        offsets: {
            start: number;
            end: number;
        };
    };
}

export function getBrowserNavigationTimingOffsets(
    browserNavigationTimingPayload: Glimpse.Messages.Payloads.Browser.INavigationTiming
): IBrowserNavigationTimingOffsets {
    const {
        connectEnd,
        redirectStart,
        fetchStart,
        responseStart,
        responseEnd,
        requestStart,
        domLoading,
        loadEventEnd,
        navigationStart
    } = browserNavigationTimingPayload;
    const networkConnectionStart = (redirectStart || fetchStart) - navigationStart;
    const networkConnectionDuration = connectEnd - (redirectStart || fetchStart);
    const sendingRequestDuration = responseStart - requestStart;
    const receivingResponseDuration = responseEnd - responseStart;
    const browserProcessingDuration = loadEventEnd - domLoading;

    return {
        [BrowserNavigationTimingSegments.PageLoad]: {
            duration: loadEventEnd - navigationStart,
            offsets: {
                start: networkConnectionStart,
                end: loadEventEnd - navigationStart
            }
        },
        [BrowserNavigationTimingSegments.NetworkConnection]: {
            duration: networkConnectionDuration,
            offsets: {
                start: networkConnectionStart,
                end: connectEnd - navigationStart
            }
        },
        [BrowserNavigationTimingSegments.SendingRequest]: {
            duration: sendingRequestDuration,
            offsets: {
                start: requestStart - navigationStart,
                end: responseStart - navigationStart
            }
        },
        [BrowserNavigationTimingSegments.ReceivingResponse]: {
            duration: receivingResponseDuration,
            offsets: {
                start: responseStart - navigationStart,
                end: responseEnd - navigationStart
            }
        },
        [BrowserNavigationTimingSegments.BrowserProcessing]: {
            duration: browserProcessingDuration,
            offsets: {
                start: domLoading - navigationStart,
                end: loadEventEnd - navigationStart
            }
        }
    };
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/RequestsOverviewSelector.ts