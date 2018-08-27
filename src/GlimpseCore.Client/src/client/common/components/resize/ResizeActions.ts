import { ISaveSizeAction, ISaveOpenAction, IToggleOpenAction } from './ResizeInterfaces';

import { createActionCreator } from 'common/actions/ActionCreator';

export const saveSize = createActionCreator<ISaveSizeAction>('common.resize.set.size');
export const saveOpenState = createActionCreator<ISaveOpenAction>('common.resize.set.open');
export const toggleOpenState = createActionCreator<IToggleOpenAction>(
    'common.resize.set.open.toggle'
);



// WEBPACK FOOTER //
// ./src/client/common/components/resize/ResizeActions.ts