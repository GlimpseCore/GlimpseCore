import escapeHtml from 'escape-html';
import tokenizeFormatString from './printfTokenizer';

function isWhitelistedProperty(property) {
    const prefixes = ['background', 'border', 'color', 'font', 'line', 'margin', 'padding', 'text', '-webkit-background', '-webkit-border', '-webkit-font', '-webkit-margin', '-webkit-padding', '-webkit-text'];
    for (let i = 0; i < prefixes.length; i++) {
        if (property.startsWith(prefixes[i])) {
            return true;
        }
    }
    return false;
}

export const formatterRegistry = (function formatterWrapper() {
    function parameterFormatter(force, obj, context, token) {
        context.objects['s' + token.substitutionIndex] = obj;

        const node = document.createElement('span');
        node.setAttribute('data-glimpse-object', 's' + token.substitutionIndex);

        return node;
    }

    function stringFormatter(value) {
        return value;
    }

    function floatFormatter(value) {
        return (typeof value !== 'number') ? 'NaN' : value;
    }

    function integerFormatter(value) {
        return (typeof value !== 'number') ? 'NaN' : Math.floor(value);
    }

    function bypassFormatter(value) {
        return (value instanceof Node) ? value : '';
    }

    function styleFormatter(value, context) {
        context.currentStyle = {};
        const buffer = document.createElement('span');
        buffer.setAttribute('style', value);
        for (let i = 0; i < buffer.style.length; i++) {
            const property = buffer.style[i];
            if (isWhitelistedProperty(property)) {
                context.currentStyle[property] = buffer.style[property];
            }
        }
    }

    (stringFormatter as any).className = 'token tokenString'; // tslint:disable-line:no-any
    (floatFormatter as any).className = 'token tokenInteger'; // tslint:disable-line:no-any
    (integerFormatter as any).className = 'token tokenInteger'; // tslint:disable-line:no-any

    return {
        node: {
            j: parameterFormatter.bind(this, false),
            s: stringFormatter,
            d: integerFormatter
        },
        browser: {
            o: parameterFormatter.bind(this, false),
            O: parameterFormatter.bind(this, true),
            s: stringFormatter,
            f: floatFormatter,
            i: integerFormatter,
            d: integerFormatter,
            c: styleFormatter,
            _: bypassFormatter
        },
        _: {
            o: parameterFormatter.bind(this, false)
        }
    };
})();

function applyCurrentStyle(element, currentStyle) {
    for (let key in currentStyle) {
        if (currentStyle.hasOwnProperty(key)) {
            element.style[key] = currentStyle[key];
        }
    }
}

const append = function append(container, content, currentStyle?, className?: string) {
    if (content instanceof Node) {
        container.appendChild(content);
    }
    else if (typeof content !== 'undefined' && content !== '') {
        let toAppend;
        if (className || currentStyle) {
            content = escapeHtml(content);

            toAppend = document.createElement('span');
            toAppend.innerHTML = content;
            if (className) {
                toAppend.className = className;
            }
            if (currentStyle) {
                applyCurrentStyle(toAppend, currentStyle);
            }
        }
        else {
            toAppend = document.createTextNode(content);
        }
        container.appendChild(toAppend);
    }
    return container;
};

function paramaterProcessor(element, parameters, context) {
    // Single parameter, or unused substitutions from above.
    for (let i = 0; i < parameters.length; ++i) {
        element.appendChild(document.createTextNode(' '));
        const node = document.createElement('span');
        const value = parameters[i];
        if (typeof value === 'string' || typeof value === 'number') {
            node.innerHTML = escapeHtml(value);
        }
        else {
            context.objects['p' + i] = value;
            node.setAttribute('data-glimpse-object', 'p' + i);
        }
        element.appendChild(node);
    }
}

function process(format, substitutions, context) {
    if (!format || !substitutions || !substitutions.length) {

        return { formattedResult: append(context.root, format, context.currentStyle), unusedSubstitutions: substitutions };
    }

    function prettyFunctionName() {
        return 'String.format("' + format + '", "' + Array.prototype.join.call(substitutions, '", "') + '")';
    }

    function warn(msg) {
        context.debug.push({ msg: prettyFunctionName() + ': ' + msg, type: 'warn' });
    }

    function error(msg) {
        context.debug.push({ msg: prettyFunctionName() + ': ' + msg, type: 'error' });
    }

    let result = context.root;
    const usedSubstitutionIndexes = {};
    const unusedSubstitutions = [];

    if (typeof format === 'string') {
        const tokens = tokenizeFormatString(format, context.formatters);
        for (let i = 0; i < tokens.length; ++i) {
            const token = tokens[i];

            if (token.type === 'string') {
                result = append(result, token.value, context.currentStyle);
                continue;
            }

            if (token.type !== 'specifier') {
                error('Unknown token type "' + token.type + '" found.');
                continue;
            }

            if (token.substitutionIndex >= substitutions.length) {
                // If there are not enough substitutions for the current substitutionIndex
                // just output the format specifier literally and move on.
                error('not enough substitution arguments. Had ' + substitutions.length + ' but needed ' + (token.substitutionIndex + 1) + ', so substitution was skipped.');
                result = append(result, '%' + (token.precision > -1 ? token.precision : '') + token.specifier, context.currentStyle);
                continue;
            }

            usedSubstitutionIndexes[token.substitutionIndex] = true;

            if (!(token.specifier in context.formatters)) {
                // Encountered an unsupported format character, treat as a string.
                warn('unsupported format character \u201C' + token.specifier + '\u201D. Treating as a string.');
                result = append(result, substitutions[token.substitutionIndex], context.currentStyle);
                continue;
            }

            const formatter = context.formatters[token.specifier];
            result = append(result, formatter(substitutions[token.substitutionIndex], context, token), context.currentStyle, formatter.className);
        }
    }
    else {
        unusedSubstitutions.push(format);
    }

    for (let i = 0; i < substitutions.length; ++i) {
        if (i in usedSubstitutionIndexes) {
            continue;
        }
        // TODO: in the future do we want to do any type detechtion here so we can show params differently
        unusedSubstitutions.push(substitutions[i]);
    }
    paramaterProcessor(result, unusedSubstitutions, context);

    return {
        formattedResult: result,
        unusedSubstitutions: unusedSubstitutions,
        debug: (context.debug.length > 0 ? context.debug : undefined),
        objects: (Object.keys(context.objects).length > 0 ? context.objects : undefined)
    };
}

export default function(format, parameters, environment) {
    const context = {
        formatters: (formatterRegistry as any).environment ||  formatterRegistry.browser, // tslint:disable-line:no-any
        currentStyle: null, // tslint:disable-line:no-null-keyword
        root: document.createElement('span'),
        debug: [],
        objects: {}
    };

    if (typeof format === 'object' && (!parameters || parameters.length === 0)) {
        return { formattedResult: append(context.root, formatterRegistry._.o(format, context, { substitutionIndex: 0 })), objects: context.objects };
    }

    return process(format, parameters, context);
}



// WEBPACK FOOTER //
// ./src/client/common/util/printf.ts