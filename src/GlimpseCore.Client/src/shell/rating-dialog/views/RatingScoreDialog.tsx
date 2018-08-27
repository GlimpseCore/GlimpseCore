import React from 'react'; // tslint:disable-line:no-unused-variable

import { RatingButtons } from './rating-buttons/RatingButtons';

import styles from './RatingDialog.scss';

// temporary commented out in case we will need the speech bubble in the future
// // tslint:disable:variable-name
// const SpeechBubble = () => {
//     return (
//         <div className={styles.speechBubble}>
//             <div className={styles.speechBubbleHeader}>Nice to meet you!</div>
//             <div className={styles.speechBubbleText}>
//                 The Glimpse team and I love our users and wanted to see how you were doing. We were wondering...
//             </div>
//             <div className={styles.speechBubbleArrow} />
//         </div>
//     );
// };

// tslint:disable:variable-name
export const RatingScoreDialog = ({ onSelect }) => {
    return (
        <div className={styles.dialog}>
            <div className={styles.section}>
                <label>How likely is it you would recommend us to a friend?</label>
            </div>
            <div className={styles.section}>
                <RatingButtons onSelect={onSelect} />
            </div>
        </div>
    );
};



// WEBPACK FOOTER //
// ./src/client/shell/rating-dialog/views/RatingScoreDialog.tsx