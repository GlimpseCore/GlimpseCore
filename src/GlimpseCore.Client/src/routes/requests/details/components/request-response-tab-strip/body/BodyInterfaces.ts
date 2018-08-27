import IMultipartSummary from '@client/modules/messages/schemas/IMultipartSummary';

export interface IRequestResponseBody {
    body?: {
        size?: number;
        form?: { [key: string]: string | string[] };
        content?: string;
        isTruncated?: boolean;
        parts?: IMultipartSummary[];
        encoding?: string;
    };
    headers: { [key: string]: string | string[] };
}

export enum BodyType {
    None = 0,
    Text,
    Form,
    Multipart
}

export enum MultipartType {
    None = 0,
    File,
    Form
}

export interface IMultipartPart {
    isTruncated?: boolean;
    mediaType?: string;
    name: string;
    type: MultipartType;
}

export interface IMultipartFilePart extends IMultipartPart {
    fileName: string;
    size?: number;
}

export interface IMultipartFormPart extends IMultipartPart {
    value?: string;
}

export interface IRequestResponseBodyResult {
    elementId?: string[];
    requestId?: string;
    isTruncated?: boolean;
    isSupported?: boolean;
    size?: number;
    content?: string | { [key: string]: string | string[] } | IMultipartPart[];
    contentType?: string;
    contentEncoding?: string;
    encoding?: string;
    capturedBodyEncoding?: string;
    mediaType?: string;
    bodyType?: BodyType;
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/body/BodyInterfaces.ts