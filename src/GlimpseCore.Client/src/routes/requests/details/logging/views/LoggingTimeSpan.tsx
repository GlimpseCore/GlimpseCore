import * as Glimpse from '@glimpse/glimpse-definitions';
import React from 'react';

import LoggingLabel from './LoggingLabel';
import { TimeDuration } from '@common/components/TimeDuration';
import MessageRowLink from '@common/components/MessageRowLink';

import styles from './LoggingTimeSpan.scss';

export interface ILoggingTimeSpanProps {
    message: {
        correlations?: {
            begin?;
            ends?;
        };
        ordinal: number;
        payload: Glimpse.Messages.Payloads.Log.ITimespanBegin &
            Glimpse.Messages.Payloads.Log.ITimespanEnd;
    };
    wasStarted: boolean;
}

export default class LoggingTimeSpan extends React.Component<ILoggingTimeSpanProps, {}> {
    public render() {
        const { message, wasStarted } = this.props;

        const name = (
            <span>
                <LoggingLabel message={message.payload.message} />
                {' '}<span>{wasStarted ? 'started.' : 'ended.'}</span>
            </span>
        );

        const createMessageLink = (ordinal: number, text: string) => {
            return (
                <MessageRowLink ordinal={ordinal} title={`Jump to message ${ordinal}`}>
                    {text}
                </MessageRowLink>
            );
        };

        let noLogsCaptured;
        let startEndMessage;
        let duration;

        if (wasStarted) {
            const hasCorrelatedEnds =
                message.correlations &&
                message.correlations.ends &&
                message.correlations.ends.length > 0;

            if (hasCorrelatedEnds) {
                const ends = message.correlations.ends;

                if (ends.length === 1) {
                    // Create 'Ended on message X.' message.
                    startEndMessage = (
                        <span className={styles.logTimeSpanFill}>
                            Ended on
                            {' '}{createMessageLink(ends[0].ordinal, `message ${ends[0].ordinal}`)}.
                        </span>
                    );
                } else {
                    // Create 'Ended on messages: X,Y,...,Z' message.
                    const endMessageLinks = [];

                    ends.forEach(end => {
                        if (endMessageLinks.length) {
                            endMessageLinks.push(', ');
                        }

                        endMessageLinks.push(createMessageLink(end.ordinal, `${end.ordinal}`));
                    });

                    startEndMessage = (
                        <span className={styles.logTimeSpanFill}>
                            Ended on messages: {endMessageLinks}
                        </span>
                    );
                }
            } else {
                startEndMessage = (
                    <span className={styles.logTimeSpanFill}>No end timer found.</span>
                );
            }
        } else {
            const hasCorrelatedBegin = message.correlations && message.correlations.begin;

            if (hasCorrelatedBegin) {
                startEndMessage = (
                    <span className={styles.logTimeSpanFill}>
                        Started on
                        {' '}
                        {createMessageLink(
                            message.correlations.begin.ordinal,
                            `message ${message.correlations.begin.ordinal}`
                        )}.
                    </span>
                );

                // If the begin and end ordinals are sequential, no messages were captured between them.
                if (message.ordinal - message.correlations.begin.ordinal === 1) {
                    noLogsCaptured = (
                        <span className={styles.logTimeSpanFill}>No messages captured.</span>
                    );
                }
            } else {
                startEndMessage = (
                    <span className={styles.logTimeSpanFill}>No begin timer found.</span>
                );
            }

            duration = (
                <span className={styles.logTimeSpanDuration}>
                    Total time: <TimeDuration duration={message.payload.duration} />
                </span>
            );
        }

        return (
            <div className={styles.logTimeSpanCell}>
                <span>
                    {name}
                    {noLogsCaptured}
                    {startEndMessage}
                </span>
                {duration}
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/logging/views/LoggingTimeSpan.tsx