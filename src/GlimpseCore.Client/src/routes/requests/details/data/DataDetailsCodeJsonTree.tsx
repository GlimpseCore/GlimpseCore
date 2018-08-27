import React from 'react'; // tslint:disable-line:no-unused-variable

import { CodeView } from '@routes/requests/components/CodeView';
import styles from '@client/routes/requests/details/data/DataDetailsQuery.scss';
import { isObject, isArray } from '@common/util/CommonUtilities';
import JsonTree from '@client/routes/requests/components/JsonTree';

export interface IDataDetailsCodeJsonTree {
    code;
    elementId: string[];
    requestId: string;
}

/**
 * renderJsonTree - function to render the Json component.
 * 
 * @param {IDataDetailsCodeJsonTree} props 
 * @return {JSX.Element} Rendered json component. 
 */
const renderJsonTree = (props: IDataDetailsCodeJsonTree): JSX.Element => {
    const { code, requestId, elementId } = props;

    return (
        <JsonTree data={code} elementId={elementId} requestId={requestId} forceExpandRoot={true} />
    );
};

/**
 * renderCodeView - function to render the CodeView component.
 * 
 * @param {Any} result Contents.
 * @return {JSX.Element} Rendered json component. 
 */
const renderCodeView = (result): JSX.Element => {
    // tslint:disable-next-line:no-null-keyword
    const code = result !== undefined && result !== null ? result.toString() : '';
    return <CodeView className={styles.codeView} language={''} code={code} />;
};
/* tslint:disable-next-line:variable-name */
const DataDetailsCodeJsonTree = (props: IDataDetailsCodeJsonTree): JSX.Element => {
    const { code } = props;

    return (
        <div>
            {isObject(code) || isArray(code) ? renderJsonTree(props) : renderCodeView(code)}
        </div>
    );
};

export { DataDetailsCodeJsonTree };



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataDetailsCodeJsonTree.tsx