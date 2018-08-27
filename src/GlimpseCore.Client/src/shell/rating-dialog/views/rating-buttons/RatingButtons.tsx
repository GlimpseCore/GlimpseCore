// tslint:disable-next-line:no-unused-variable
import React from 'react';

import styles from './RatingButtons.scss';

interface IRatingButtonsProps {
    count?: number;
};

interface IRatingButtonsCallbacks {
    onSelect: (rating: number) => any; // tslint:disable-line:no-any
};

interface IColor {
    r: number;
    g: number;
    b: number;
}

/**
 * getCurrentRatingColor - function to calculate current color for trating buttons.
 * 
 * @param {Number} p Current Progress.
 * @return {IColor} Current button color.
 */
export const getCurrentRatingColor = (rating: number, total: number = 10): string => {
    const p = (rating - 1) / (total - 1);

    const startColor = { r: 193, g: 74, b: 58 };
    const endColor = { r: 116, g: 197, b: 120 };

    const color = {
        r: Math.floor(startColor.r + ((endColor.r - startColor.r) * p)),
        g: Math.floor(startColor.g + ((endColor.g - startColor.g) * p)),
        b: Math.floor(startColor.b + ((endColor.b - startColor.b) * p))
    };

    return `rgb(${color.r}, ${color.g}, ${color.b})`;
};

const getAnimationDelay = (p: number) => {
    return .2 * p;
};

/* tslint:disable-next-line:variable-name */
export const RatingButtons = ({ count = 10, onSelect }: IRatingButtonsProps & IRatingButtonsCallbacks) => {
    const buttons = [];
    let p = 0;
    let step = 1 / (count - 1);

    for (let i = 0; i < count; i++) {
        const rating = i + 1;

        buttons.push(
            <button
                key={i}
                className={styles.button}
                onClick={() => { onSelect(rating); }}
                style={{
                    color: getCurrentRatingColor(rating),
                    borderColor: getCurrentRatingColor(rating),
                    animationDelay: `${getAnimationDelay(p)}s`
                }}>
                <span className={styles.buttonText}>
                    { rating }
                </span>
            </button>
        );

        p += step;
    }

    return (
        <div className={styles.root}>
            { buttons }
        </div>
    );
};



// WEBPACK FOOTER //
// ./src/client/shell/rating-dialog/views/rating-buttons/RatingButtons.tsx