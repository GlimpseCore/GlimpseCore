function isDigitAt(string, index) {
    const c = string.charCodeAt(index);
    return (48 <= c && c <= 57);
}
interface IToken {
    type: string;
    value?: string;
    specifier?: string;
    precision?: string;
    substitutionIndex?: string;
}
export default function tokenizeFormatString(format, formatters) {
    const tokens: IToken[] = [];
    let substitutionIndex = 0;

    function addStringToken(str) {
        if (tokens.length && tokens[tokens.length - 1].type === 'string') {
            tokens[tokens.length - 1].value += str;
        }
        else {
            tokens.push({ type: 'string', value: str });
        }
    }

    function addSpecifierToken(specifier, precision, index) {
        tokens.push({ type: 'specifier', specifier, precision, substitutionIndex: index });
    }

    if (!format) {
        return tokens;
    }

    let index = 0;
    for (let precentIndex = format.indexOf('%', index); precentIndex !== -1; precentIndex = format.indexOf('%', index)) {
        if (format.length === index) {  // unescaped % sign at the end of the format string.
            break;
        }
        addStringToken(format.substring(index, precentIndex));
        index = precentIndex + 1;

        if (format[index] === '%') {
            // %% escape sequence.
            addStringToken('%');
            ++index;
            continue;
        }

        if (isDigitAt(format, index)) {
            // The first character is a number, it might be a substitution index.
            const number = parseInt(format.substring(index), 10);
            while (isDigitAt(format, index)) {
                ++index;
            }

            // If the number is greater than zero and ends with a '$',
            // then this is a substitution index.
            if (number > 0 && format[index] === '$') {
                substitutionIndex = (number - 1);
                ++index;
            }
        }

        let precision = -1;
        if (format[index] === '.') {
            // This is a precision specifier. If no digit follows the '.',
            // then the precision should be zero.
            ++index;
            precision = parseInt(format.substring(index), 10);
            if (isNaN(precision)) {
                precision = 0;
            }

            while (isDigitAt(format, index)) {
                ++index;
            }
        }

        if (!(format[index] in formatters)) {
            addStringToken(format.substring(precentIndex, index + 1));
            ++index;
            continue;
        }

        addSpecifierToken(format[index], precision, substitutionIndex);

        ++substitutionIndex;
        ++index;
    }

    addStringToken(format.substring(index));

    return tokens;
}



// WEBPACK FOOTER //
// ./src/client/common/util/printfTokenizer.ts