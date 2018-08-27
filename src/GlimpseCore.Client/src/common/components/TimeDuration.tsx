import React from 'react';

import { roundWithFixedPoints } from 'common/util/StringUtilities';

export class TimeDurationValue {
    public readonly value: string;
    public readonly unit: string;

    constructor(value: string, unit: string) {
        this.value = value;
        this.unit = unit;
    }

    public toString() {
        return `${this.value} ${this.unit}`;
    }
}

export enum TimeDurationFormat {
    /**
     * Format the duration using the default formatting.
     */
    Default = 0,

    /**
     * Format the duration with fractional numbers, converting to fractional seconds as necessary.
     *
     * Examples:
     *   123.45  => `123.45 ms`
     *   1023.45 => `1.02 s`
     */
    FractionalMillesecondsFractionalSeconds,

    /**
     * Format the duration with whole milliseconds, converting to fractional seconds as necessary.
     *
     * Examples:
     *   123.45  => `123 ms`
     *   1023.45 => `1.02 s`
     */
    WholeMillesecondsFractionalSeconds
}

export function formatMilliseconds(ms: number, format?: TimeDurationFormat): TimeDurationValue {
    const effectiveFormat = format || TimeDurationFormat.FractionalMillesecondsFractionalSeconds;
    const hasFractionalMilliseconds =
        effectiveFormat === TimeDurationFormat.FractionalMillesecondsFractionalSeconds;

    const roundedValue = roundWithFixedPoints(ms, hasFractionalMilliseconds ? 2 : 0);

    if (roundedValue >= 1000) {
        return new TimeDurationValue((roundedValue / 1000).toFixed(2), 's');
    } else {
        return new TimeDurationValue(roundedValue.toFixed(hasFractionalMilliseconds ? 2 : 0), 'ms');
    }
}

export interface ITimeDurationProps {
    duration: number;
    format?: TimeDurationFormat;
    valueClassName?: string;
    unitClassName?: string;
}

export class TimeDuration extends React.PureComponent<ITimeDurationProps, {}> {
    public render() {
        let { duration, format, valueClassName, unitClassName } = this.props;

        if (duration !== undefined) {
            const formattedValue = formatMilliseconds(duration, format);
            return (
                <div>
                    <span className={valueClassName}>{formattedValue.value}</span>
                    <span className={unitClassName}>&nbsp;{formattedValue.unit}</span>
                </div>
            );
        } else {
            return <span>-</span>;
        }
    }
}

export default TimeDuration;



// WEBPACK FOOTER //
// ./src/client/common/components/TimeDuration.tsx