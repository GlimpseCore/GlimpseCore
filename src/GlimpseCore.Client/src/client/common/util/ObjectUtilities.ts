import forEach from 'lodash/forEach';

export function getValueAtKeyCaseInsensitive<T>(
    values: { [key: string]: T },
    searchKey: string
): T {
    const normalizedSearchKey = searchKey.toLowerCase();
    let foundValue = undefined;

    forEach(values, (value, key) => {
        if (key.toLowerCase() === normalizedSearchKey) {
            foundValue = value;
            return false;
        }
    });

    return foundValue;
}

export function getKeyCaseInsensitive<T>(values: { [key: string]: T }, searchKey: string): string {
    const normalizedSearchKey = searchKey.toLowerCase();
    let foundKey = undefined;

    forEach(values, (value, key) => {
        if (key.toLowerCase() === normalizedSearchKey) {
            foundKey = key;
            return false;
        }
    });

    return foundKey;
}

export function convertToObject(value: string): {} {
    try {
        return JSON.parse(value);
    } catch (e) {
        // nothing to do here
    }
}

/**
 * areObjectsEqual - function to shallow check if two objects are equal.
 *
 * @param {Object} Object1.
 * @param {Object} Object2.
 * @returns {Boolean} If two objects are shallow equal.
 */
export const areObjectsEqual = (obj1, obj2): boolean => {
    const len1: number = Object.keys(obj1).length;
    const len2: number = Object.keys(obj2).length;
    if (len1 !== len2) {
        return false;
    }

    // check if keys are equal
    for (let key in obj1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
};



// WEBPACK FOOTER //
// ./src/client/common/util/ObjectUtilities.ts