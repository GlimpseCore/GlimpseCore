// tslint:disable-next-line:no-unused-variable
import React from 'react';
import bytes from 'bytes';
import classNames from 'classnames';

import {
    FixedWidthLeftColumnTable,
    IColumnInfo
} from 'common/components/FixedWidthLeftColumnTable';
import Icon from 'common/components/Icon';
import {
    IMultipartPart,
    IMultipartFilePart,
    IMultipartFormPart,
    MultipartType
} from './BodyInterfaces';

import styles from './MultipartSummary.scss';

function getContentTypeText(part: IMultipartPart): string {
    return part.mediaType ? part.mediaType : '[text/plain]';
}

function getFilePartText(part: IMultipartFilePart): string {
    let text = `File: ${part.fileName}`;

    if (part.size !== undefined) {
        text += ` (${bytes.format(part.size, { unitSeparator: ' ' })})`;
    }

    return text;
}

const columns: IColumnInfo[] = [
    {
        header: '',
        isFixed: true,
        measureFunc: (param: IMultipartPart) => 13,
        valueFunc: (param: IMultipartPart) => {
            return param.isTruncated
                ? <div title="The content of this field has been truncated.">
                      <Icon className={styles.multipartSummaryTruncationIcon} shape="Warning" />
                  </div>
                : undefined;
        },
        maxWidth: 200
    },
    {
        header: 'Name',
        isFixed: true,
        valueFunc: (param: IMultipartPart) => param.name,
        maxWidth: 200
    },
    {
        header: 'Content Type',
        textFunc: getContentTypeText,
        valueFunc: (param: IMultipartPart) => {
            const text = getContentTypeText(param);

            return (
                <span
                    className={classNames({
                        [styles.multipartSummaryUndefinedContentType]:
                            param.mediaType === undefined || param.mediaType.length === 0
                    })}>
                    {text}
                </span>
            );
        }
    },
    {
        header: 'Content',
        valueFunc: (param: IMultipartPart) => {
            switch (param.type) {
                case MultipartType.File:
                    const filePart = param as IMultipartFilePart;

                    return getFilePartText(filePart);
                case MultipartType.Form:
                    const formPart = param as IMultipartFormPart;

                    return formPart.value;
                default:
                    return undefined;
            }
        }
    }
];

// tslint:disable-next-line:variable-name
export const MultipartSummary = (props: { className?: string; parts: IMultipartPart[] }) => {
    const { className, parts } = props;

    return <FixedWidthLeftColumnTable className={className} columns={columns} params={parts} />;
};

export default MultipartSummary;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/body/MultipartSummary.tsx