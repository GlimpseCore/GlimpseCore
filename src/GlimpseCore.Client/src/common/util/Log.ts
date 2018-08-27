/**
 * Module intended to abstract `console.log` method to have the control over `DEBUG`/`PROD` cases.
 */

export const timeStart = (label: string) => {
    if (!DEBUG) { return; }
    console.time(label); // tslint:disable-line:no-console
};

export const timeEnd = (label: string) => {
    if (!DEBUG) { return; }
    console.timeEnd(label); // tslint:disable-line:no-console
};

export const log = (...args) => {
    if (!DEBUG) { return; }
    console.log.apply(console, args); // tslint:disable-line:no-console
};

export const logError = (...args) => {
    if (!DEBUG) { return; }
    console.error.apply(console, args); // tslint:disable-line:no-console
};



// WEBPACK FOOTER //
// ./src/client/common/util/Log.ts