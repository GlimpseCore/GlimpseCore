import * as Glimpse from '@_glimpse/glimpse-definitions';

import { getValueAtKeyCaseInsensitive } from './ObjectUtilities';
import { IMessage } from '@modules/messages/schemas/IMessage';
import parseUrl from 'url-parse';
import { getNamesForEnum } from '@common/util/CommonUtilities';

/**
 * bit flag enums to classify the content type of a request
 */
export enum ContentTypeClass {
    None = 0,
    /* tslint:disable:no-bitwise */
    Data = 1 << 0,
    Document = 1 << 1,
    Font = 1 << 2,
    Image = 1 << 3,
    Script = 1 << 4,
    Media = 1 << 5,
    Style = 1 << 6,
    TextTrack = 1 << 7,
    Other = 1 << 8,
    /* tslint:enable:no-bitwise */
    All = 0xffffffff // max 32 values above
}

export function getExcludedContentTypeClassNames(value: ContentTypeClass): string[] {
    return getNamesForEnum(ContentTypeClass).filter(contentTypeClassName => {
        return !isFlagSet(value, ContentTypeClass[contentTypeClassName]);
    });
}

/**
 * Helper function to determine if the given value has the specified bit flag set
 */
export function isFlagSet(value: ContentTypeClass, flag: ContentTypeClass): boolean {
    if (flag === 0) {
        return value === flag;
    } else {
        // tslint:disable-next-line:no-bitwise
        return (value & flag) === flag;
    }
}

export function isDataType(value: ContentTypeClass) {
    return isFlagSet(value, ContentTypeClass.Data);
}

export function isDocumentType(value: ContentTypeClass) {
    return isFlagSet(value, ContentTypeClass.Document);
}

export interface IMediaTypeMetadata {
    /**
     * Content type category categorization
     */
    contentTypeClass: ContentTypeClass;

    /**
     * Type that should be targeted for highlighting the body
     * of this content type.
     */
    highlight?: string;

    /**
     * Whether follow mode should target this content type
     */
    follow?: boolean;
}

/**
 * map from media-type string to associated metadata
 */
const mediaTypeToMetadata: { [key: string]: IMediaTypeMetadata } = {
    'text/html': {
        contentTypeClass: ContentTypeClass.Document,
        highlight: 'xml',
        follow: true
    },
    'text/plain': {
        contentTypeClass: ContentTypeClass.Document,
        highlight: 'nohighlight'
    },
    'application/xhtml+xml': {
        contentTypeClass: ContentTypeClass.Document,
        highlight: 'xml'
    },
    'text/xml': { contentTypeClass: ContentTypeClass.Data, highlight: 'xml' },
    'application/json': {
        contentTypeClass: ContentTypeClass.Data,
        highlight: 'json'
    },
    'text/css': { contentTypeClass: ContentTypeClass.Style, highlight: 'css' },
    'text/xsl': { contentTypeClass: ContentTypeClass.Style, highlight: 'xml' },
    'image/jpg': { contentTypeClass: ContentTypeClass.Image },
    'image/jpeg': { contentTypeClass: ContentTypeClass.Image },
    'image/pjpeg': { contentTypeClass: ContentTypeClass.Image },
    'image/png': { contentTypeClass: ContentTypeClass.Image },
    'image/gif': { contentTypeClass: ContentTypeClass.Image },
    'image/bmp': { contentTypeClass: ContentTypeClass.Image },
    'image/svg+xml': {
        // tslint:disable-next-line:no-bitwise
        contentTypeClass: ContentTypeClass.Image | ContentTypeClass.Font | ContentTypeClass.Document
    },
    'image/vnd.microsoft.icon': { contentTypeClass: ContentTypeClass.Image },
    'image/webp': { contentTypeClass: ContentTypeClass.Image },
    'image/x-icon': { contentTypeClass: ContentTypeClass.Image },
    'image/x-xbitmap': { contentTypeClass: ContentTypeClass.Image },
    'font/ttf': { contentTypeClass: ContentTypeClass.Font },
    'font/otf': { contentTypeClass: ContentTypeClass.Font },
    'font/woff': { contentTypeClass: ContentTypeClass.Font },
    'font/woff2': { contentTypeClass: ContentTypeClass.Font },
    'font/truetype': { contentTypeClass: ContentTypeClass.Font },
    'font/opentype': { contentTypeClass: ContentTypeClass.Font },
    'application/octet-stream': {
        // tslint:disable-next-line:no-bitwise
        contentTypeClass: ContentTypeClass.Image | ContentTypeClass.Font
    },
    'application/font-woff': { contentTypeClass: ContentTypeClass.Font },
    'application/font-woff2': { contentTypeClass: ContentTypeClass.Font },
    'application/x-font-woff': { contentTypeClass: ContentTypeClass.Font },
    'application/x-font-type1': { contentTypeClass: ContentTypeClass.Font },
    'application/x-font-ttf': { contentTypeClass: ContentTypeClass.Font },
    'application/x-truetype-font': { contentTypeClass: ContentTypeClass.Font },
    'application/x-www-form-urlencoded': {
        contentTypeClass: ContentTypeClass.Data
    },
    'text/javascript': {
        contentTypeClass: ContentTypeClass.Script,
        highlight: 'javascript'
    },
    'text/ecmascript': {
        contentTypeClass: ContentTypeClass.Script,
        highlight: 'javascript'
    },
    'application/javascript': {
        contentTypeClass: ContentTypeClass.Script,
        highlight: 'javascript'
    },
    'application/ecmascript': {
        contentTypeClass: ContentTypeClass.Script,
        highlight: 'javascript'
    },
    'application/x-javascript': {
        contentTypeClass: ContentTypeClass.Script,
        highlight: 'javascript'
    },
    'text/javascript1.1': {
        contentTypeClass: ContentTypeClass.Script,
        highlight: 'javascript'
    },
    'text/javascript1.2': {
        contentTypeClass: ContentTypeClass.Script,
        highlight: 'javascript'
    },
    'text/javascript1.3': {
        contentTypeClass: ContentTypeClass.Script,
        highlight: 'javascript'
    },
    'text/jscript': {
        contentTypeClass: ContentTypeClass.Script,
        highlight: 'javascript'
    },
    'text/livescript': {
        contentTypeClass: ContentTypeClass.Script,
        highlight: 'livescript'
    },
    'text/vtt': { contentTypeClass: ContentTypeClass.TextTrack }
};

/**
 * map from file extension to associated media type
 */
const fileExtensionToMediaType: { [key: string]: string } = {
    '.html': 'text/html',
    '.txt': 'text/plain',
    '.xhtml': 'application/xhtml+xml',
    '.xml': 'text/xml',
    '.json': 'application/json',
    '.css': 'text/css',
    '.xsl': 'text/xsl',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.pjpeg': 'image/pjpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
    '.vnd': 'image/vnd.microsoft.icon',
    '.webp': 'image/webp',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.truetype': 'font/truetype',
    '.opentype': 'font/opentype',
    '.js': 'text/javascript',
    '.vtt': 'text/vtt'
};

export function classifyRequest(
    request: IMessage<Glimpse.Messages.Payloads.Web.IRequest>,
    response: IMessage<Glimpse.Messages.Payloads.Web.IResponse>
): IMediaTypeMetadata {
    // 1.  Use the content-type header on the response if available
    let metadata: IMediaTypeMetadata | undefined = undefined;
    if (response && response.payload && response.payload.headers) {
        const contentType = response ? getContentType(response.payload.headers) : undefined;
        if (contentType) {
            const mediaType = getMediaTypeFromContentType(contentType);
            if (mediaType && mediaTypeToMetadata[mediaType]) {
                metadata = mediaTypeToMetadata[mediaType];
            }
        }
    }

    // 2.  Use the file extension of the path on the URL
    if (!metadata && request && request.payload && request.payload.url) {
        // use request url
        const parsed = parseUrl(request.payload.url);
        let lastSlash = parsed.pathname.lastIndexOf('/');
        lastSlash = lastSlash < 0 ? 0 : lastSlash;
        const lastSegment = parsed.pathname.substring(lastSlash);
        const lastDotIndex = lastSegment.lastIndexOf('.');
        if (lastDotIndex >= 0) {
            const fileExtension = lastSegment.substring(lastDotIndex);
            if (fileExtension) {
                metadata = mediaTypeToMetadata[fileExtensionToMediaType[fileExtension]];
            }
        }
    }

    // 3.  TODO:  https://github.com/Glimpse/Glimpse.Client/issues/713.
    //     Map this request to an browser-resource message in a related request to see if this is a resource and if we can classify this
    //     via the initiatorType value.  Currently, don't have a clean way to correlate navigation requests to associated resource requests.

    // 4.  Use the accept header on the request.
    if (!metadata && request && request.payload && request.payload.headers) {
        const acceptHeader = request ? getAcceptHeader(request.payload.headers) : undefined;
        if (acceptHeader) {
            metadata = getMediaTypeFromAcceptHeader(acceptHeader);
        }
    }

    // 5.  Default to Other
    if (!metadata) {
        metadata = { contentTypeClass: ContentTypeClass.Other };
    }

    return metadata;
}

export function getMediaTypeMetadata(mediaType: string): IMediaTypeMetadata {
    let metadata = { contentTypeClass: ContentTypeClass.Other };
    if (mediaType && mediaTypeToMetadata[mediaType]) {
        metadata = mediaTypeToMetadata[mediaType];
    }
    return metadata;
}

function parseHeaderForMediaType(headerValue: string | undefined, separatorChar: string): string | undefined {
    if (headerValue) {
        let idx = headerValue.indexOf(separatorChar);
        if (idx < 0) {
            return headerValue.trim();
        } else {
            return headerValue.substring(0, idx).trim();
        }
    }
    return;
}

export function getMediaTypeFromContentType(contentType: string): string | undefined {
    return parseHeaderForMediaType(contentType, ';');
}

function getMediaTypeFromAcceptHeader(acceptHeader: string): IMediaTypeMetadata | undefined {
    const parts = acceptHeader.split(',');
    for (let i = 0; i < parts.length; i++) {
        const mediaType = parseHeaderForMediaType(parts[i], ';');
        const metadata = mediaType ? mediaTypeToMetadata[mediaType] : undefined;
        if (metadata) {
            return metadata;
        }
    }
    return;
}

export function getContentType(headers: { [key: string]: string | string[] }): string | undefined {
    return getHeaderValue('Content-Type', headers);
}

export function getContentEncoding(headers: { [key: string]: string | string[] }): string | undefined {
    return getHeaderValue('Content-Encoding', headers);
}

function getAcceptHeader(headers: { [key: string]: string | string[] }): string | undefined {
    return getHeaderValue('Accept', headers);
}

export function getHeaderValue(
    headerKey: string,
    headers: { [key: string]: string | string[] }
): string | undefined {
    if (headers) {
        const contentTypeHeader = getValueAtKeyCaseInsensitive(headers, headerKey);

        if (contentTypeHeader) {
            if (contentTypeHeader instanceof Array) {
                if (contentTypeHeader.length > 0) {
                    return contentTypeHeader[0];
                }
            } else {
                return contentTypeHeader;
            }
        }
    }

    return undefined;
}



// WEBPACK FOOTER //
// ./src/client/common/util/ContentTypes.ts