import debounce from 'lodash/debounce';
import { Dispatch } from 'redux';

import { timeStart, timeEnd, log, logError } from '@common/util/Log';

/**
 * Ensures that reducer state is persisted to local storage as required
 * @param reducer whos results are being saved
 * @param key that should be used in local storage
 */
export function persistReducerState(
    reducer: (state: {}, action: {}) => {},
    key: string,
    wait = 2000,
    maxWait = 2000
) {
    const slowSaveState = debounce(saveState, wait, { maxWait });

    function saveState(state: {}) {
        log('[STATE] Saving state');
        timeStart('[PERF:STATE] ReducerUtilities.persistReducerState');
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (e) {
            logError('[STATE] Could not persist state: ', e);
        }
        timeEnd('[PERF:STATE] ReducerUtilities.persistReducerState');
    }

    return (state: {}, action: {}) => {
        const newState = reducer(state, action);
        if (state !== newState) {
            slowSaveState(newState);
        }

        return newState;
    };
}

/**
 * Reteive state from local storage given a key
 * @param key that should be used in targetting local storage
 */
// tslint:disable-next-line:no-any
export function retrieveReducerState(key: string, defaultState?: any): {} {
    log('[STATE] Retrieving state');
    timeStart('[PERF:STATE] ReducerUtilities.retrieveReducerState'); // tslint:disable-line:no-console
    let result = defaultState;
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            result = JSON.parse(storedValue);
        }
    } catch (e) {
        logError('[STATE] Could not retrieve state: ', e);
    }
    timeEnd('[PERF:STATE] ReducerUtilities.retrieveReducerState'); // tslint:disable-line:no-console

    return result;
}

export interface IPurgeableRecord {
    [key: string]: {
        /**
         * The millisecond timestamp for when this state was last updated
         */
        updated: number;
    };
}

/**
 * Removes reconds that don't meet the cutoff time
 * @param records that should be purged
 * @param cutoffAmount amount by which records will be removed if thye haven't been updated
 */
export function purgeOldRecords<T>(
    records: T & IPurgeableRecord,
    cutoffAmount = 1000 * 60 * 60 * 24 * 1
): T {
    const currentCutoffTime = new Date().getTime() - cutoffAmount;

    log('[STATE] Checking if old records should be removed');
    const result = {} as T & IPurgeableRecord;
    for (const key in records) {
        // only keep records that are greater than the cutoff
        if (records[key].updated > currentCutoffTime) {
            result[key] = records[key];
        } else {
            log('[STATE] Removing old record: ', records[key]);
        }
    }
    log(
        '[STATE] Finished checking if old records should be removed, checked -',
        Object.keys(records).length
    );

    return result;
}

function triggerPurgeOldRecords(
    action: () => any, // tslint:disable-line:no-any
    dispatcher: Dispatch<any>, // tslint:disable-line:no-any
    delay: number
) {
    dispatcher(action());

    setTimeout(() => triggerPurgeOldRecords(action, dispatcher, delay), delay);
}

/**
 * Setup trigger which will purge old records that aren't needed any longer
 * @param action to be triggered when purge should occur
 * @param dispatcher instance
 * @param intialDelay from when the initial purge will occur
 * @param followupDelay time to follow up purges post intial occurance
 */
export function setupPurgeOldRecords(
    action: () => any, // tslint:disable-line:no-any
    dispatcher: Dispatch<any>, // tslint:disable-line:no-any
    intialDelay = 10000,
    followupDelay = 1000 * 60 * 60 * 6
) {
    setTimeout(() => triggerPurgeOldRecords(action, dispatcher, followupDelay), intialDelay);
}



// WEBPACK FOOTER //
// ./src/client/common/util/ReducerUtilities.ts