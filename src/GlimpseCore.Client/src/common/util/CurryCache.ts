import { isObject } from '@common/util/CommonUtilities';

const getArrayHash = args => {
    let hash = '';
    args.forEach(arg => {
        hash += isObject(arg) ? JSON.stringify(arg) : arg;
    });
    return hash;
};

/**
 * `curryCacheFactory` - functory function to create `curryCacheFunction` with
 *                       a fresh `cache` reference.
 */
export const curryCacheFactory = () => {
    // create a fresh `cache` reference
    const cache = {};
    /**
     * `curryCacheFunction` - function retruns curried `fn` with `args`
     * in `idempotent` manner - thus it returns equal function reference
     * for the equal set of arguments.
     *
     * @param {Function} fn Function to curry cache.
     * @param {_} args Set of arguments to curry the function with.
     * @return {Function} Curried cached function.
     */
    return (fn, ...args) => {
        const hash = getArrayHash(args);

        return cache[hash] === undefined
            ? (cache[hash] = fn.bind(null /* tslint:disable-line:no-null-keyword */, ...args))
            : cache[hash];
    };
};



// WEBPACK FOOTER //
// ./src/client/common/util/CurryCache.ts