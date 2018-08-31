import uriTemplate from 'uri-templates';

import { createActionCreator, createSimpleActionCreator } from '@common/actions/ActionCreator';
import { getOriginalQueryStringParam } from '@common/util/UrlUtilities';
import { IMetadataState } from './IMetadataState';

export const featchRequestedPayloadAction = createSimpleActionCreator('METADATA_REQUESTED_PAYLOAD');

export const fetchReceivedPayloadAction = createActionCreator<{ metadata: IMetadataState }>(
    'METADATA_RECEIVED_PAYLOAD'
);

let _metadata;
const _callbacks : Function[] = [];

function flushListeners(metadata: IMetadataState) {
    while (_callbacks.length > 0) {
        const callback = _callbacks.shift() as Function;
        callback(metadata);
    }
}

function templatizeMetadata(metadata: IMetadataState): IMetadataState {
    Object.keys(metadata.resources).forEach(function(key) {
        metadata.resources[key] = uriTemplate(metadata.resources[key] as string);
    });

    return metadata;
}

export const metadataUriProperty = 'metadataUri';

function getMetadataUri() {
    let metadataUri = getOriginalQueryStringParam(metadataUriProperty);
    if (!metadataUri) {
        if (!FAKE_SERVER) {
            // TODO: Make this better w/ a custom dialog, caching & perhaps a list of recently used servers?
            metadataUri = prompt(
                "What's the address to your Glimpse server metadata?",
                window.location.origin + '/glimpse/metadata'
            );
        } else {
            metadataUri = window.location.origin + '/glimpse/metadata';
        }
    }

    return metadataUri;
}

export function fetch() {
    return dispatch => {
        dispatch(featchRequestedPayloadAction());

        const metadataUri = getMetadataUri() || undefined;
        return window
            .fetch(metadataUri)
            .then<IMetadataState>(response => response.json())
            .then(body => {
                const metadata = templatizeMetadata(body);
                const payload = {
                    metadata
                };

                // trigger dispatcher notification about data
                dispatch(fetchReceivedPayloadAction(payload));

                // notify waiting listeners that data is now in
                _metadata = metadata;
                flushListeners(metadata);

                return payload;
            });
    };
}

export function current(callback: { (metadata: IMetadataState): void }) {
    if (_metadata) {
        callback(_metadata);
    } else {
        _callbacks.push(callback);
    }
}



// WEBPACK FOOTER //
// ./src/client/modules/metadata/MetadataActions.ts