import { Store, Dispatch } from 'redux';
import utpl from 'uri-templates';

import { current as currentMetadata } from '@modules/metadata/MetadataActions';

import { IUpdatePersistedState } from '@client/shell/update/UpdateInterfaces';
import { IStoreState } from '@client/IStoreState';
import {
    createActionCreator,
    createSimpleActionCreator
} from '@client/common/actions/ActionCreator';
import { getUpdateInfo } from '@client/shell/update/UpdateSelectors';
import { isSameDateAs } from '@client/common/util/DateTimeUtilities';

export const showLatestVersionAction = createActionCreator<IUpdatePersistedState>(
    'shell.update.latestversion.show'
);

export const resetLatestVersionAction = createSimpleActionCreator(
    'shell.update.latestversion.reset'
);

// tslint:disable-next-line:no-any
function checkForNewVersion(dispatcher: Dispatch<any>) {
    currentMetadata(metadata => {
        const currentVersion = GLIMPSE_VERSION;

        const uriTemplate = metadata.resources['version-check'] as utpl.URITemplate;
        const uri = uriTemplate.fillFromObject({
            currentVersion: currentVersion
        });

        fetch(uri)
            .then(response => response.json())
            .then(response => {
                const latestVersion =
                    response && response['dist-tags'] && response['dist-tags'].latest;

                // if versions aren't the same, going to assume its newer but only if
                // current is in the list... this makes sure that during dev we don't
                // ping notify ourselves
                let version = undefined;
                if (
                    latestVersion !== currentVersion &&
                    response &&
                    response.time &&
                    response.time[currentVersion] !== undefined
                ) {
                    version = latestVersion;
                }

                const versionState = {
                    latestVersion: version,
                    dateTimeChecked: new Date().getTime(),
                    atTimeOfCheckVersion: currentVersion
                };

                // store this explicitly as we want to access from HUD
                try {
                    localStorage.setItem('glimpseLatestVersion', JSON.stringify(versionState));
                } catch (e) {
                    console.error('[UPDATE] Error whilst writing to local localStorage', e);
                }

                dispatcher(showLatestVersionAction(versionState));
            })
            .catch(e => {
                console.error('[UPDATE] Error whilst checking for updates', e);
            });
    });
}

export function setupUpdateChecker(store: Store<IStoreState>) {
    // tslint:disable-line:no-any
    const versionInfo = getUpdateInfo(store.getState());
    let forceCheck = false;

    // if we did a check and the version number at the time of that check
    // isn't the current version is now, we must have done an update, hence
    // lets reset the state of the message and allow the check to confirm
    if (
        versionInfo.atTimeOfCheckVersion !== undefined &&
        versionInfo.atTimeOfCheckVersion !== GLIMPSE_VERSION
    ) {
        store.dispatch(resetLatestVersionAction());

        forceCheck = true;
    }

    // if we determined that we went through a version update or
    // if we have never done a check before or if we haven't already
    // checked today, lets check for a new version
    if (
        forceCheck === true ||
        versionInfo.dateTimeChecked === undefined ||
        !isSameDateAs(new Date(), new Date(versionInfo.dateTimeChecked))
    ) {
        // deplayed execution to give client time to load
        setTimeout(() => checkForNewVersion(store.dispatch), 5000);
    }
}



// WEBPACK FOOTER //
// ./src/client/shell/update/UpdateActions.ts