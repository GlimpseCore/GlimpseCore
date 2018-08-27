// import React from 'react';
// import ReactDOM from 'react-dom';
// import ReactUpdates from 'react-dom/lib/ReactUpdates';
// import ReactDefaultBatchingStrategy from 'react-dom/lib/ReactDefaultBatchingStrategy';

// import { reportReactException } from './Errors';
// import { ErrorScreen } from '@common/components/ErrorScreen';
// import { rootElement } from '@common/init/getRootElement';

// export const initBatchingStrategyErrorHandling = () => {
//     const reactTryCatchBatchingStrategy = {
//         // this is part of the BatchingStrategy API. simply pass along
//         // what the default batching strategy would do.
//         get isBatchingUpdates() {
//             return ReactDefaultBatchingStrategy.isBatchingUpdates;
//         },

//         batchedUpdates(...args) {
//             try {
//                 ReactDefaultBatchingStrategy.batchedUpdates(...args);
//             } catch (error) {
//                 // to prevent infinite error loop - we need to be careful
//                 // in the catch block
//                 try {
//                     console.warn('React error: ', error);
//                     reportReactException(error);
//                     ReactDOM.render(React.createElement(ErrorScreen, {}), rootElement);
//                     // fatal error - something went wrong while reporting - just fail
//                     // to prevent infinite error loop
//                 } catch (e) {
//                     console.error('Fatal error!', e);
//                 }
//             }
//         }
//     };

//     ReactUpdates.injection.injectBatchingStrategy(reactTryCatchBatchingStrategy);
// };



// // WEBPACK FOOTER //
// // ./src/client/modules/errors/BatchingStrategyHandler.ts