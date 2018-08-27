import { default as telemetryClient } from '@modules/telemetry/TelemetryClient';
import { IProperties } from '@modules/telemetry/TelemetryInterfaces';

enum GlimpseErrorSeverity {
    Error = 3,
    Warning = 4,
    Info = 6
}

enum GlimpseErrorClass {
    User,
    Internal
}

interface IGlimpseError {
    severity: GlimpseErrorSeverity;
    errorClass: GlimpseErrorClass;
    errorCode: ErrorCode;
    message: string;
    stack?: string;
}

enum ErrorCode {
    None = 0,
    WindowOnError = 1,
    ConsoleErrorWrite = 2,
    ReduxException = 3,
    ReactException = 4,
    DateParsingError = 5,
    MalformedMessage = 6
}

export function reportWindowOnError(
    source: string,
    lineNumber: number,
    columnNumber: number,
    errorMessage: string,
    errorObject: Error
) {
    const stack: string = errorObject ? errorObject.stack : undefined;
    const e: IGlimpseError = {
        stack,
        severity: GlimpseErrorSeverity.Error,
        errorClass: GlimpseErrorClass.Internal,
        errorCode: ErrorCode.WindowOnError,
        message: errorMessage
    };

    const props: IProperties = {
        lineNumber: `${lineNumber}`,
        columNumber: `${columnNumber}`,
        source: `${source}`
    };

    reportError(e, props);
}

// tslint:disable-next-line:no-any
export function reportConsoleErrorWrite(message: string, params: any[]) {
    const e: IGlimpseError = {
        severity: GlimpseErrorSeverity.Error,
        errorClass: GlimpseErrorClass.Internal,
        errorCode: ErrorCode.ConsoleErrorWrite,
        message
    };

    const props: IProperties = {};
    for (let i = 0; i < params.length; i++) {
        props[`param_${i}`] = params[i];
    }

    reportError(e, props);
}

export function reportReactException(error: Error) {
    const e: IGlimpseError = {
        stack: error.stack,
        severity: GlimpseErrorSeverity.Error,
        errorClass: GlimpseErrorClass.Internal,
        errorCode: ErrorCode.ReactException,
        message: error.message
    };

    return reportError(e, {});
}

/**
 * `reportDateParsingError` - temporary report function to catch the unusual user's
 *                         date parsing browser behaviour.
 *
 *  Issue: https://github.com/Glimpse/Glimpse.Client/issues/1221
 */
export function reportDateParsingError(error: Error, data: IProperties = {}) {
    const e: IGlimpseError = {
        stack: error.stack,
        severity: GlimpseErrorSeverity.Error,
        errorClass: GlimpseErrorClass.Internal,
        errorCode: ErrorCode.DateParsingError,
        message: error.message
    };

    return reportError(e, data);
}

/**
 * `reportMalformedMessageError` - temporary report function to catch
 *                                 the case when some message have no `context`.
 */
export function reportMalformedMessageError(error: Error, data: IProperties = {}) {
    const e: IGlimpseError = {
        stack: error.stack,
        severity: GlimpseErrorSeverity.Error,
        errorClass: GlimpseErrorClass.Internal,
        errorCode: ErrorCode.MalformedMessage,
        message: error.message
    };

    return reportError(e, data);
}

export function reportReduxException(actionType: string, error: Error) {
    const e: IGlimpseError = {
        stack: error.stack,
        severity: GlimpseErrorSeverity.Error,
        errorClass: GlimpseErrorClass.Internal,
        errorCode: ErrorCode.ReduxException,
        message: error.message
    };

    return reportError(e, { actionType });
}

function reportError(error: IGlimpseError, extraProps: IProperties) {
    const properties = Object.assign({ errorSlug: ErrorCode[error.errorCode] }, extraProps, error);
    properties.stack = properties.stack || getStack();
    telemetryClient.sendEvent('Error', properties, {});
}

function getStack(): string {
    let error: Error = new Error();
    if (!error.stack) {
        // fallback in case some browsers need to throw error to get a stack
        try {
            throw new Error();
        } catch (err) {
            error = err;
        }
    }
    return error.stack;
}



// WEBPACK FOOTER //
// ./src/client/modules/errors/Errors.ts