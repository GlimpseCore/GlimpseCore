export namespace Messages {
    export namespace Payloads {
        export namespace Web {
            export interface IRequest {
                url: string;
                headers: { [key: string]: string; }
                startTime: any;
            }
            export interface IResponse {
                headers: { [key: string]: string | string[]; }
                url: any;
                duration: any;
                timing: any;
            }
        }
        export namespace Mixin {
            export interface ICallStack {
                frames: any;
            }
            export interface ICallStackFrame {
                lineNumber?: number;
                columnNumber?: number;
                fileName?: string;
            }
            export interface ICorrelation {
                isCollapsed: any;
                category: any;
            }
            export interface ICorrelationBegin {}
            export interface ICorrelationEnd {}
        }
        export namespace Data {
            export namespace Store {
                export namespace Mongodb {
                    interface IMongoRequest {
                        database: any;
                        connectionHost: any;
                        connectionPort: any;
                        duration: any;
                        operation: any;
                        collection: any;
                        options: any;
                    }
                    export interface IReadStart extends IMongoRequest {
                        query: any;
                        correlationId: any;
                    }
                    export interface IReadEnd extends IMongoRequest {
                        totalRecordsRead: any;
                    }
                    export interface IInsert extends IMongoRequest {
                        count: any;
                        insertedIds: Array<any>;
                        docs: any;
                    }
                    export interface IUpdate extends IMongoRequest {
                        modifiedCount: any;
                        upsertedCount: any;
                        matchedCount: any;
                        query: any;
                        updates: any;
                    }
                    export interface IDelete extends IMongoRequest {
                        count: any;
                        query: any;
                    }
                }
            }
            export namespace Http {
                export interface IRequest {
                    correlationId: any;
                    url: any;
                    protocol: any;
                    method: any;
                }
                export interface IResponse {
                    correlationId: any;
                    statusCode: any;
                    duration: any;
                    headers: any;
                    timing: any;
                    statusMessage: any;
                }
            }
        }
        export namespace Log {
            export interface ICount {
                count: any;
            }
            export interface IGroupBegin {
                correlationId: any;
            }
            export interface IWrite {
                message: any;
            }
            export interface ITimespanBegin {
                message: any;
                duration: any;
            }
            export interface ITimespanEnd {
                message: any;
                duration: any;
            }
        }
        export namespace Middleware {
            export interface IStart {
                name: any;
                packageName: any;
                correlationId: any;
                displayName: any;
            }
            export interface IEnd {
                name: any;
                operations: Array<any>;
                headers: any;
                duration: any;
            }
            export namespace End {
                export namespace Definitions {
                    export interface IOperation {
                        type: any;
                    }
                    export interface IResponseStatusCode {
                        statusCode: any;
                    }
                }
            }
        }
        export namespace Browser {
            export interface IResourceTiming {
                initiatorType: any;
            }
            export interface IResource {
                timings: any;
            }
            export interface INavigationTiming {
                requestStart: any;
                navigationStart: any;
                loadEventStart: any;
                loadEventEnd: any;
                domInteractive: any;
                domainLookupStart: any;
                lookupDomainDuration: any;
                connectStart: any;
                connectDuration: any;
                secureConnectionStart: any;
                connectEnd: any;
                redirectStart: any;
                redirectDuration: any;
                fetchStart: any;
                responseStart: any;
                responseEnd: any;
                domLoading: any;
            }
        }
        export namespace Debug {
            export interface ITimestamp {
                name: any;
            }
            export interface ITimestampMeasurement {
                name: any;
                correlationMessageIds: any;
            }
        }
    }
}
