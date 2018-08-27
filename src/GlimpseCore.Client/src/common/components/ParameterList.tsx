import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import React from 'react';

import { FixedWidthLeftColumnTable, nameValueColumns } from './FixedWidthLeftColumnTable';

export interface IParameterValue {
    [key: string]: string | string[];
}

export interface IParameterListProps {
    className?: string;
    params: IParameterValue;
}

export class ParameterList extends React.Component<IParameterListProps, {}> {
    public render() {
        const { className, params } = this.props;

        const flattenedParamList = map(params, (value: string | string[], key: string) => ({
            name: key,
            value: value
        }))
            .map(
                pair =>
                    Array.isArray(pair.value)
                        ? pair.value.map(value => ({ name: pair.name, value: value }))
                        : [{ name: pair.name, value: pair.value }]
            )
            .reduce((mappedParams, param) => mappedParams.concat(param), []);
        const paramList = sortBy(flattenedParamList, pair => pair.name);

        return (
            <FixedWidthLeftColumnTable
                className={className}
                columns={nameValueColumns}
                params={paramList}
            />
        );
    }
}

export default ParameterList;



// WEBPACK FOOTER //
// ./src/client/common/components/ParameterList.tsx