const DEFAULT_FONT_FAMILY = "'Segoe UI', 'Selawik', Tahoma, Geneva, Verdana, sans-serif";
const DEFAULT_FONT_WEIGHT = 400;
const DEFAULT_FONT_STYLE = 'normal';

const canvas = document.createElement('canvas');

export function measureTextWidth({
    text,
    size,
    family = DEFAULT_FONT_FAMILY,
    weight = DEFAULT_FONT_WEIGHT,
    style = DEFAULT_FONT_STYLE
}) {
    if (process.env.NODE_ENV !== 'test') {
        const ctx = canvas.getContext('2d');
        ctx.font = `${weight} ${style} ${size} ${family}`;
        return ctx.measureText(text).width;
    }

    return 0;
}



// WEBPACK FOOTER //
// ./src/client/common/util/TextUtilities.ts