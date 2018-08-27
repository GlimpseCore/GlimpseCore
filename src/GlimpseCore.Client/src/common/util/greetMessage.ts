import browserSupportsLogStyles from 'browser-supports-log-styles';

/**
 * Funtion to detect if `ua` has `Edge` in it.
 *
 * @returns {Boolean} If `ua` has `Edge` in it
 */
const isEdge = (): boolean => {
    return navigator.appVersion.indexOf('Edge') > -1;
};

const NAME = 'Project Glimpse';
const link = `https://aka.ms/hi-glimpse`;

const greetMessage = version => {
    if (browserSupportsLogStyles() && isEdge() === false) {
        const VERT_PADDING = 7;
        const FONT = ' font-size: 10px; font-weight: 500; line-height: 35px;';
        // colors
        const DEEP_GRAY = '#1B1B1C';
        const GRAY = '#F4F3F4';
        const DEEP_PINK = '#ff2424';

        const args = [
            `\n%c%c%c${NAME} ◦ ${version} ◦%cIssues/Feedback?%c${link}%c♥%c\n\n`,
            `background: ${DEEP_GRAY}; padding: ${VERT_PADDING + 1}px 3px; ${FONT}`, // dark line
            `background: ${DEEP_PINK}; padding: ${VERT_PADDING + 1}px 1px; ${FONT}`, // red line
            `color: white; background: ${DEEP_GRAY}; padding: ${VERT_PADDING + 1}px 12px; ${FONT}`, // project name
            `color: ${DEEP_GRAY}; background: ${GRAY}; padding: ${VERT_PADDING}px ${VERT_PADDING}px ${VERT_PADDING}px 10px; ${FONT} border-top: 1px solid ${DEEP_GRAY}; border-bottom: 1px solid ${DEEP_GRAY};`, // message
            `color: ${DEEP_GRAY}; background: ${GRAY}; padding: ${VERT_PADDING}px ${VERT_PADDING /
                1.2}px ${VERT_PADDING}px 0; ${FONT} border-top: 1px solid ${DEEP_GRAY}; border-bottom: 1px solid ${DEEP_GRAY};`, // link
            `color: ${DEEP_PINK}; background: ${DEEP_GRAY}; padding: ${VERT_PADDING +
                1}px 10px; ${FONT}`, // heart
            `background: transparent;`
        ];

        console.log.apply(console, args);
    } else {
        console.log(`\n`);
        console.log(
            `⚡ ${NAME} ◦ v${version} ⚡ Issues/Feedback? ↪ ${link} ↩ ♥`
        );
        console.log(`\n`);
    }
};

export default greetMessage;



// WEBPACK FOOTER //
// ./src/client/common/util/greetMessage.ts