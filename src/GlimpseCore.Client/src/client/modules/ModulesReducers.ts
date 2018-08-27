import { messagesSessionReducer } from './messages/MessagesReducer';
import { metadataSessionReducer } from './metadata/MetadataReducer';

export default {
    messages: messagesSessionReducer,
    metadata: metadataSessionReducer
};



// WEBPACK FOOTER //
// ./src/client/modules/ModulesReducers.ts