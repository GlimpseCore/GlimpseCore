export function isArray(a) {
    return !!a && a.constructor === Array;
}

export function isObject(a) {
    return !!a && a.constructor === Object;
}

export function isObjectEmpty(a) {
    return !isObject(a) || Object.keys(a).length === 0;
}

export function getNamesForEnum(t: Object): string[] {
    const values = Object.keys(t).map(k => t[k]);
    const names = values.filter(v => typeof v === 'string') as string[];
    return names;
}

export function getIntegersForEnum(t: Object): number[] {
    const values = Object.keys(t).map(k => t[k]);
    const numbers = values.filter(v => typeof v === 'number') as number[];
    return numbers;
}

/**
 * clamp - function to clamp a number between two bounds so it is guaranteed
 *         `>=` than `min` and `<=` than `max`.
 *
 * @param {Number} value Value to clamp.
 * @param {Number} min The min bound.
 * @param {Number} max The max bound.
 * @return {Number} The clamped value in range of [min...max] inclusive.
 */
export const clamp = (value: number, min: number = 0, max: number): number => {
    const upperBound = Math.min(value, max);
    // apply lower bound
    return Math.max(upperBound, min);
};

/**
 * stopPropagation - function to stop event propagation.
 */
export const stopPropagation = e => {
    e.stopPropagation();

    return e;
};

export function messageTargetId(ordinal: string | number): string {
    return `message:${ordinal}`;
}



// WEBPACK FOOTER //
// ./src/client/common/util/CommonUtilities.ts