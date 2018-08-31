export namespace Messages {
    export namespace Payloads {
        export namespace Web {
            export interface IRequest {
                url: string;
                headers: { [key: string]: string | string[]; }
            }
            export interface IResponse {
                headers: { [key: string]: string | string[]; }
            }
        }
        export namespace Mixin {
            export interface ICallStackFrame {
                lineNumber?: number;
                columnNumber?: number;
                fileName?: string;
            }

        }
    }
}
