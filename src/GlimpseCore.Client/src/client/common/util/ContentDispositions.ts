import contentDisposition from 'content-disposition';

import { getValueAtKeyCaseInsensitive } from './ObjectUtilities';

const contentDispositionFormDataType = 'form-data';
const contentDispositionName = 'name';
const contentDispositionFileName = 'filename';

export enum ContentDispositionType {
    Other = 0,
    FormData
}

export interface IContentDisposition {
    type: ContentDispositionType;
    fieldName?: string;
    fileName?: string;
    parameters: { [key: string]: string };
}

export function parseContentDisposition(header: string): IContentDisposition {
    if (header) {
        const parsedHeader = contentDisposition.parse(header);

        return {
            type: parsedHeader.type === contentDispositionFormDataType
                ? ContentDispositionType.FormData
                : ContentDispositionType.Other,
            fieldName: parsedHeader.parameters[contentDispositionName],
            fileName: parsedHeader.parameters[contentDispositionFileName],
            parameters: parsedHeader.parameters
        };
    }

    return undefined;
}

export function getContentDisposition(headers: { [key: string]: string | string[] }): string {
    const values = getValueAtKeyCaseInsensitive(headers, 'content-disposition');

    return Array.isArray(values) ? values[0] : values;
}



// WEBPACK FOOTER //
// ./src/client/common/util/ContentDispositions.ts