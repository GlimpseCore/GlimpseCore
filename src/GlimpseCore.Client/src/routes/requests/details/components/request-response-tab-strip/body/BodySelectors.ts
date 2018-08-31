import Reselect, { createSelector } from 'reselect';
import querystring from 'querystring-browser';

import {
    BodyType,
    IRequestResponseBody,
    IRequestResponseBodyResult,
    IMultipartPart,
    IMultipartFilePart,
    IMultipartFormPart,
    MultipartType
} from './BodyInterfaces';
import {
    ContentDispositionType,
    getContentDisposition,
    parseContentDisposition
} from '@common/util/ContentDispositions';
import { IStoreState } from '@client/IStoreState';
import { IMessage } from '@modules/messages/schemas/IMessage';
import IMultipartSummary from '@modules/messages/schemas/IMultipartSummary';
import { isObjectEmpty } from '@common/util/CommonUtilities';
import {
    getContentType,
    getContentEncoding,
    getMediaTypeFromContentType
} from '@common/util/ContentTypes';

function parseBodyPart(
    rawContent: string,
    rawSize: number,
    summary: IMultipartSummary
): IMultipartPart {
    const contentDisposition = getContentDisposition(summary.headers);

    if (contentDisposition) {
        const parsedContentDisposition = parseContentDisposition(contentDisposition);

        if (
            parsedContentDisposition &&
            parsedContentDisposition.type === ContentDispositionType.FormData
        ) {
            if (parsedContentDisposition.fieldName) {
                const contentType = getContentType(summary.headers);
                const mediaType = getMediaTypeFromContentType(contentType);

                let isTruncated: boolean;

                if (summary.bodyEndIndex >= 0) {
                    isTruncated = summary.bodyEndIndex > rawSize;
                }

                const part = <IMultipartPart>{
                    isTruncated,
                    mediaType,
                    name: parsedContentDisposition.fieldName
                };

                if (parsedContentDisposition.fileName === undefined) {
                    let value: string;

                    if (rawContent && summary.bodyStartIndex >= 0 && summary.bodyEndIndex >= 0) {
                        value = rawContent.slice(summary.bodyStartIndex, summary.bodyEndIndex);
                    }

                    const formPart = <IMultipartFormPart>part;

                    formPart.type = MultipartType.Form;
                    formPart.value = value;
                } else {
                    const filePart = <IMultipartFilePart>part;

                    filePart.fileName = parsedContentDisposition.fileName;
                    filePart.size = summary.bodyLength;
                    filePart.type = MultipartType.File;
                }

                return part;
            }
        }
    }

    return undefined;
}

function parseBodyParts(
    rawContent: string,
    rawSize: number,
    summaries: IMultipartSummary[]
): IMultipartPart[] {
    return summaries
        .map(summary => parseBodyPart(rawContent, rawSize, summary))
        .filter(summary => summary !== undefined);
}

export function createGetBodySelector(
    getRequestResponseMessage: Reselect.Selector<IStoreState, IMessage<IRequestResponseBody>>
): Reselect.Selector<IStoreState, IRequestResponseBodyResult> {
    return createSelector(getRequestResponseMessage, message => {
        if (message) {
            const payload = message.payload;

            let isSupported = true;
            let isTruncated = false;
            let size = 0;

            // Note: sometimes requests don't have a content type, which
            // means that both `contentType` and `mediaType` here will be
            // undefined in some cases
            const contentType = getContentType(payload.headers);
            const mediaType = getMediaTypeFromContentType(contentType);
            const contentEncoding = getContentEncoding(payload.headers);
            const encoding = payload.body.encoding;
            const capturedBodyEncoding = encoding;

            let content;
            let bodyType = BodyType.None;
            // determine if the type is supported or not
            if (!contentType && payload && payload.body && payload.body.size > 0) {
                isSupported = false;
            } else if (payload && payload.body) {
                isTruncated = payload.body.isTruncated;
                size = payload.body.size;

                // server might have provided us with form data, if so use it
                if (!isObjectEmpty(payload.body.form)) {
                    bodyType = BodyType.Form;
                    content = payload.body.form;
                } else if (
                    payload.body.content &&
                    mediaType &&
                    mediaType.toLowerCase() === 'application/x-www-form-urlencoded'
                ) {
                    // otherwise lets manually check for form content and parse if can
                    bodyType = BodyType.Form;
                    content = querystring.parse(payload.body.content);
                } else if (
                    payload.body.content &&
                    payload.body.parts &&
                    mediaType &&
                    mediaType.toLowerCase() === 'multipart/form-data'
                ) {
                    bodyType = BodyType.Multipart;
                    content = parseBodyParts(payload.body.content, size, payload.body.parts);
                } else {
                    // lastly leave the content in its raw state
                    bodyType = BodyType.Text;
                    content = payload.body.content;
                }
            }

            return {
                elementId: ['body', message.id],
                requestId: message.context.id,
                isTruncated,
                isSupported,
                size,
                content,
                contentType,
                contentEncoding,
                capturedBodyEncoding,
                mediaType,
                bodyType
            };
        }

        return {};
    });
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/body/BodySelectors.ts