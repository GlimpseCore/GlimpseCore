import { isObject } from 'common/util/CommonUtilities';

import { INITIAL_STATE as requestsRecordStructure } from 'client/routes/requests/RequestsReducers';
import { INITIAL_STATE as resizePanelsStructure } from 'client/common/components/resize/ResizeReducers';

export const cleanupObjectKeys = (desired, current, genericKeysMap = {}, parent?) => {
    // is there is no `current` key, return the `default`
    // state for that key and stop tree traversal
    if (current === undefined) {
        return desired;
    }
    // [base case]: if primitive return, priority on the `current` key if defined
    if (!isObject(desired)) {
        return (current !== undefined) ? current : desired;
    }
    // for each key, make sure the subtrees match
    const result = {};
    for (let key of Object.keys(desired)) {
        // check if the `key` is on the generic keys map, and its `value` is equal to the `parent`
        // if so, we need to copy the current(persisted) state only and move on
        // otherwise just make sure the subtrees correspond by recurrent call
        const genericRecord = genericKeysMap[key];
        result[key] = (genericRecord && genericRecord.getParent() === parent && (current[key] !== undefined))
            ? genericRecord.process(current[key])
            : cleanupObjectKeys(desired[key], current[key], genericKeysMap, key);
    }

    return result;
};

/**
 * factory that crate a fucntion to cleanup state, used when we have
 * a generic key object but the structure inside the keys is unknown.
 * e.g. { [generic key]: [unknown structure] }, for instance `persisted->requests->[generic key]->state->expansion->[unknown structure]`
 * thus we just need to copy the keys.
 */
const genericKeysCopyFactory = (desired, parent: string)  => {
    return {
        process: (currentState) => {
            return { ...currentState };
        },
        getParent: () => {
            return parent;
        }
    };
};

/**
 * factory that crate a fucntion to cleanup state, used when we have
 * a generic key object but the structure inside the keys is known.
 * e.g. { [generic key]: [known structure] }, for instance `persisted->requests`
 */
const genericKeysCleanupFactory = (desired, parent: string)  => {
    return {
        process: (currentState) => {
            const result = {};
            for (let key of Object.keys(currentState)) {
                const value = currentState[key];
                result[key] = cleanupObjectKeys(desired, value, {}, parent);
            }
            return result;
        },
        getParent: () => {
            return parent;
        }
    };
};

export const cleanupRequests = genericKeysCleanupFactory(requestsRecordStructure, 'persisted');
export const cleanupResizePanels = genericKeysCleanupFactory(resizePanelsStructure, 'global');
export const copyExpansionElements = genericKeysCopyFactory({}, 'state');

export const genericKeysMap = {
    resizePanels: cleanupResizePanels,
    requests: cleanupRequests,
    expansion: copyExpansionElements
};

export const cleanupPersistedGlobal = (defaultState, currentState) => {
    const safeCurrentState = isObject(currentState) ? currentState : {};
    const persistedPersisted = safeCurrentState.persisted || {};

    return {
        ...defaultState,
        ...safeCurrentState,
        persisted: cleanupObjectKeys(defaultState.persisted, persistedPersisted, genericKeysMap, 'persisted')
    };
};



// WEBPACK FOOTER //
// ./src/client/common/util/CleanupObjectKeys.ts