import { isObject, isArray } from '@common/util/CommonUtilities';

/**
 * Converts strings of the form 'one-two-three' to 'One-Two-Three', also called 'train-case'.
 */
export function trainCase(value: string): string {
    if (value) {
        let newValue = '';

        for (let i = 0; i < value.length; i++) {
            newValue += i === 0 || value[i - 1] === '-' ? value[i].toUpperCase() : value[i];
        }

        return newValue;
    }

    return value;
}

export function roundWithFixedPoints(value: number, fixedPoints: number): number {
    if (fixedPoints < 0 || fixedPoints > 2) {
        throw new Error('Fixed points must be 0, 1, or 2.');
    }

    // NOTE: This attempts to do proper decimal-place rounding (see http://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript).

    if (fixedPoints === 1) {
        return Math.round((value + 0.0001) * 10) / 10;
    } else if (fixedPoints === 2) {
        return Math.round((value + 0.00001) * 100) / 100;
    }

    return Math.round(value);
}

export function toStringWithFixedPoints(value: number, fixedPoints: number): string {
    if (fixedPoints < 0 || fixedPoints > 2) {
        throw new Error('Fixed points must be 0, 1, or 2.');
    }

    let roundedValue = roundWithFixedPoints(value, fixedPoints);

    return roundedValue.toFixed(fixedPoints);
}

export function toBoolean(value: string, defaultValue: boolean = false): boolean {
    if (value === 'false' || value === '0') {
        return false;
    } else if (value === 'true' || value === '1') {
        return true;
    }

    return defaultValue;
}

/**
 *  truncateString - function to trancate string to certain length
 *                   with ellipsis at the end.
 *
 * @param {String} str String to truncate.
 * @param {Number} len Truncate length.
 * @return {String} Truncated string.
 *
 */
export const truncateString = (str: string, len: number = 20): string => {
    // get string length
    const stringLength = str.length;
    // get result length
    const resultLength = Math.min(stringLength, len - 2);
    // get truncated string
    let newString = str.substr(0, resultLength);
    // if we trancated the string, add `..` at the end
    if (resultLength < stringLength) {
        newString += '..';
    }

    return newString;
};

/**
 * addClosingBrackets - function to add closing `"` if number
 *                      of brackets is not equal.
 *
 * @param {String} str String to add closing brakcets to.
 * @param {String} brackets Brackets to use.
 * @return {String} String with equal number of open/closing brackets.
 */
const addClosingBrackets = (str: string, brackets: string = '"'): string => {
    let cnt = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === brackets && str[i - 1] !== '\\') {
            cnt++;
        }
    }

    return str + (cnt % 2 !== 0 ? brackets : '');
};

/**
 * truncateJSON - function to truncate `JSON` string to certain length.
 *
 * @param {JSONType} obj Object or array to trauncate.
 * @param {Number} len Length of the result string including ellipsis.
 * @return {String} Truncated string.
 */
// tslint:disable-next-line:no-any
declare type JSONType = any[] | { [key: string]: any };
export const truncateJSON = (obj: JSONType, len: number = 20): string => {
    const postfix = isArray(obj) ? ']' : '}';
    const shortenStr = addClosingBrackets(truncateString(JSON.stringify(obj), len - 1));
    const lastChar = shortenStr[shortenStr.length - 1];
    // if last character is not the same as it should for the type of the object(array or object)
    // add the appropriate character at the end, else we are good
    return (lastChar !== postfix)
            ? shortenStr + postfix
            : shortenStr;
};

/**
 * trancateItemsInArray - function to trancate items in array
 *                        to strings with certain length.
 * @param {Array} items Array of any items.
 * @return {Array} Array with truncated items.
 */
// tslint:disable-next-line:no-any
export const trancateItemsInArray = (items): any[] => {
    const result : any[] = [];
    const THRESHOLD = 50;

    for (let item of items) {
        if (typeof item === 'string') {
            item = truncateString(item, THRESHOLD);
        }

        if (isObject(item) || isArray(item)) {
            item = truncateJSON(item, THRESHOLD);
        }

        result.push(item);
    }

    return result;
};



// WEBPACK FOOTER //
// ./src/client/common/util/StringUtilities.ts