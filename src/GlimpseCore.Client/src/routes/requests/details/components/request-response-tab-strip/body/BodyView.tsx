import React from 'react';
import bytes from 'bytes';
import classNames from 'classnames';

import { isObject } from 'common/util/CommonUtilities';
import { getMediaTypeMetadata } from 'common/util/ContentTypes';

import styles from './BodyView.scss';
import commonStyles from 'common/components/Common.scss';

import { BodyType, IMultipartPart, IRequestResponseBodyResult } from './BodyInterfaces';
import { CodeView } from 'routes/requests/components/CodeView';
import { InformationLabel } from 'common/components/InformationLabel';
import MultipartSummary from './MultipartSummary';
import { ParameterList, IParameterValue } from 'common/components/ParameterList';
import { ungzip } from 'pako/lib/inflate';

interface IBodyViewContentErrors {
    /**
     *
     * Whether base64 decoding failed (true if it failed)
     */
    base64Decoding: boolean;
    /**
     *
     * Whether GZIP deflation failed (true if it failed)
     */
    gzipInflation: boolean;
}

export class BodyView extends React.Component<IRequestResponseBodyResult, {}> {
    public render() {
        const { bodyType, isSupported, mediaType, elementId, requestId, capturedBodyEncoding, contentEncoding, content } = this.props;
        let renderedContent = content;

        let component;
        const errors: IBodyViewContentErrors = {
            base64Decoding: false,
            gzipInflation: false
        };

        if (renderedContent) {
            if (typeof renderedContent === 'string') {
                if (capturedBodyEncoding === 'base64') {
                    try {
                        renderedContent = atob(renderedContent);

                        if (contentEncoding && contentEncoding.toLowerCase() === 'gzip') {
                            try {
                                renderedContent = ungzip(renderedContent, {to: 'string'});
                            } catch (e) {
                                errors.gzipInflation = true;
                            }
                        }
                    } catch (e) {
                        errors.base64Decoding = true;
                    }
                }

                component = (
                    <CodeView
                        language={this.getClassNameForContentType()}
                        code={renderedContent as string}
                        elementId={elementId}
                        requestId={requestId}
                    />
                );
            } else if (bodyType === BodyType.Multipart) {
                component = (
                    <MultipartSummary
                        className={styles.contentTable}
                        parts={content as IMultipartPart[]}
                    />
                );
            } else if (isObject(renderedContent)) {
                component = <ParameterList className={styles.contentTable} params={renderedContent as IParameterValue} />;
            } else {
                component = renderedContent;
            }
        } else if (!isSupported) {
            const message = !mediaType
                ? 'Empty `content-type` requests not currently supported'
                : '`' + mediaType + '` support coming soon';
            component = (
                <div className={classNames(styles.message, commonStyles.noData)}>{message}</div>
            );
        } else {
            component = (
                <div className={classNames(styles.message, commonStyles.noData)}>
                    No body content found
                </div>
            );
        }

        return (
            <div className={styles.body}>
                {this.renderMetadata()}
                {this.renderContentMessage(errors)}
                <div className={styles.content}>
                    {component}
                </div>
            </div>
        );
    }

    private renderContentMessage(errors: IBodyViewContentErrors) {
        const { content, isTruncated, contentEncoding } = this.props;

        if (content && isTruncated) {
            return (
                <InformationLabel
                    text="Maximum viewable content reached. Result has been truncated for display purposes."
                    textClassName={styles.contentMessage}
                />
            );
        } else if (content && contentEncoding && contentEncoding.toLowerCase() === 'gzip') {
            if (errors.gzipInflation) {
                return <InformationLabel
                    text="Unable to display inflated GZIP content."
                    textClassName={styles.contentMessage}
                />;
            }

            return (
                <InformationLabel
                    text="Displaying inflated GZIP content."
                    textClassName={styles.contentMessage}
                />
            );
        }
    }

    private renderMetadata() {
        const { size, mediaType, contentType, isSupported, content } = this.props;

        const displaySize = size !== undefined ? bytes.format(size, { unitSeparator: ' ' }) : '--';

        if (isSupported && content) {
            return (
                <div className={styles.metadata}>
                    {displaySize}<span className={styles.metadataSpacer} />
                    <span title={contentType}>{mediaType}</span>
                </div>
            );
        }
    }

    private getClassNameForContentType(): string {
        const { mediaType } = this.props;

        const categories = getMediaTypeMetadata(mediaType);

        return (categories && categories.highlight) || '';
    }
}

export default BodyView;



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/components/request-response-tab-strip/body/BodyView.tsx