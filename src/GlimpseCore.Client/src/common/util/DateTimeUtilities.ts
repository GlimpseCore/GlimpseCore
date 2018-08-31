import { reportDateParsingError } from '@modules/errors/Errors';

const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
const timeOptions = { hour: '2-digit', minute: '2-digit' };

const dateFormat = new Intl.DateTimeFormat(navigator.language, dateOptions);
const timeFormat = new Intl.DateTimeFormat(navigator.language, timeOptions);

/**
 * `reportError` - temporary function helper for `safeParseDate` function,
 *                 see below for details.
 */
const reportError = (e: Error, name: string, value: string) => {
    const { language, oscpu } = navigator as any; // tslint:disable-line:no-any
    const message: string = e.message;

    e.message = `${name}: "${message}", with value: ${value}. // navigatorLanguage: ${language}, navigatorOSCPU: ${oscpu}`;

    reportDateParsingError(e, {
        navigatorLanguage: language,
        navigatorOSCPU: oscpu
    });
};

/**
 * `safeParseDate` - temporary function to catch the unusual user's
 *                   date parsing browser behaviour.
 *
 *  Issue: https://github.com/Glimpse/Glimpse.Client/issues/1221
 */
const safeParseDate = (parseObject: Intl.DateTimeFormat, name: string, value: string): string => {
    try {
        return parseObject.format(new Date(value));
    } catch (e) {
        reportError(e, name, value);
        try {
            // try replace `-` with `/` to make `Safari` happy
            value = value.replace(/-/g, '/');
            return parseObject.format(new Date(value));
        } catch (e) {
            // all attempts to parse the date failed ->
            // return `-` to indicate that no date is avaliable
            reportError(e, name, value);
            return '-';
        }
    }
};

export function getTime(value) {
    return safeParseDate(timeFormat, 'getTime', value);
}

export function getDate(value) {
    return safeParseDate(dateFormat, 'getDate', value);
}

export function isSameDateAs(aDate, bDate) {
    return (
        aDate.getFullYear() === bDate.getFullYear() &&
        aDate.getMonth() === bDate.getMonth() &&
        aDate.getDate() === bDate.getDate()
    );
}



// WEBPACK FOOTER //
// ./src/client/common/util/DateTimeUtilities.ts