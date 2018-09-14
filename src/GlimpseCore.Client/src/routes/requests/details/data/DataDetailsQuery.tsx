// tslint:disable-next-line:no-unused-variable
import React from 'react';
import { connect } from 'react-redux';

import { CodeView, ICodeViewProps } from '@routes/requests/components/CodeView';
import { getSelectedOperationSelector } from './DataSelectors';
import { IStoreState } from '@client/IStoreState';
import styles from './DataDetailsQuery.scss';
import { trancateItemsInArray } from '@common/util/StringUtilities';
import { RedisCommandDocs } from './RedisCommandDocs';
import { IDataOperation } from '@routes/requests/details/data/DataInterfaces';

interface IDataDetailsQuery extends ICodeViewProps {
    method: string;
    language: string;
    code;
}

// tslint:disable-next-line:variable-name
const DataDetailsQueryComponent = (props: IDataDetailsQuery): JSX.Element => {
    const { code, language, method } = props;

    return (
        <div>
            <RedisCommandDocs command={method} />
            <CodeView className={styles.codeView} code={code} language={language} />
        </div>
    );
};

function mapStateToProps(state: IStoreState, ownProps): IDataDetailsQuery {
    const operation = getSelectedOperationSelector(state) as IDataOperation;

    return {
        method: operation.method,
        code: `${operation.method}\n  ${trancateItemsInArray(operation.options).join('\n  ')}`,
        language: 'redis'
    };
}

// tslint:disable-next-line:variable-name
export const DataDetailsQuery = connect(mapStateToProps)(DataDetailsQueryComponent);



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/DataDetailsQuery.tsx