import React from 'react'; // tslint:disable-line:no-unused-variable
import { connect } from 'react-redux';

import { expandAction, collapseAction } from './expansion/ExpansionActions';
import { getExpansionState, isExpanded } from './expansion/ExpansionSelectors';
import { IStoreState } from '@client/IStoreState';

// NOTE: We install a custom fork of react-json-tree (from a *.tgz in ./bin),
//       with added support for expand/collapse notifications. A PR with that
//       change has been submitted: https://github.com/alexkuz/react-json-tree/pull/57.
//       An issue to track the PR and switch to a new release has also been created:
//       https://github.com/Glimpse/Glimpse.Client/issues/160

const JSONTree = require('react-json-tree').default; // tslint:disable-line:variable-name no-var-requires

// jsontree settings
const themeJSONTree = {
    extend: {
        scheme: 'default',
        author: 'chris kempson (http://chriskempson.com)',
        base00: '#181818', // BACKGROUND_COLOR
        base01: '#282828',
        base02: '#383838',
        base03: '#73b157', // ITEM_STRING_EXPANDED_COLOR
        base04: '#b8b8b8',
        base05: '#d8d8d8',
        base06: '#e8e8e8',
        base07: '#f8f8f8', // TEXT_COLOR
        base08: '#b8b8b8', // NULL_COLOR, UNDEFINED_COLOR, FUNCTION_COLOR, SYMBOL_COLOR
        base09: '#b6cda9', // NUMBER_COLOR, BOOLEAN_COLOR
        base0A: '#f7ca88',
        base0B: '#cd917a', // STRING_COLOR, DATE_COLOR, ITEM_STRING_COLOR
        base0C: '#86c1b9',
        base0D: '#f1f1f1', // LABEL_COLOR, ARROW_COLOR
        base0E: '#ba8baf',
        base0F: '#a16946'
    },
    tree: {
        backgroundColor: 'transparent',
        display: 'inline-block',
        verticalAlign: 'top',
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0
    },
    value: ({ style }, nodeType, keyPath) => ({
        style: Object.assign({}, style, { paddingLeft: '2em', marginLeft: '0.75em' })
    }),
    arrowContainer: ({ style }, arrowStyle) => ({
        style: Object.assign({}, style, {
            paddingRight: '0.25em',
            fontFamily: `'Segoe UI Symbol', sans-serif`
        })
    }),
    nestedNode: ({ style }, keyPath, nodeType, expanded, expandable) => ({
        style: Object.assign({}, style, { paddingTop: keyPath.length === 1 ? '0' : '0.25em' })
    }),
    nestedNodeLabel: ({ style }, keyPath, nodeType, expanded, expandable) => ({
        style: Object.assign({}, style, {
            display: !expanded && keyPath.length === 1 ? 'none' : 'inline-block'
        })
    }),
    nestedNodeItemString: ({ style }, keyPath, nodeType, expanded) => ({
        style: Object.assign({}, style, {
            color: '#f1f1f1',
            display: expanded ? 'none' : 'inline',
            paddingLeft: 0
        })
    })
};

interface IItemStringStyle {
    color: string;
    fontStyle: 'unset' | 'initial' | 'inherit' | 'italic' | 'normal' | 'oblique';
}

const itemStringStyle: IItemStringStyle = {
    color: themeJSONTree.extend.base08,
    fontStyle: 'italic'
};

const getItemString = (function() {
    function dataType(data) {
        return Object.prototype.toString.call(data).slice(8, -1);
    }
    function nodeValue(item, key) {
        const type = dataType(item);
        let color = themeJSONTree.extend.base0B;
        if (type === 'Array' || type === 'Object') {
            color = '#c586a1'; // TODO: make a theme color
            item = type;
        } else if (type === 'Number' || type === 'Boolean') {
            item = String(item);
            color = themeJSONTree.extend.base09;
        } else if (type === 'String') {
            item = "'" + item + "'";
        } else {
            // tslint:disable-next-line:no-null-keyword
            if (item === null || item === undefined) {
                color = themeJSONTree.extend.base08;
            }
            item = String(item);
        }
        return <span key={key} style={{ color }}>{item}</span>;
    }
    function rootArray(data, itemString) {
        const components = ['[ '] as any[]; // tslint:disable-line:no-any
        for (let i = 0; i < data.length; i++) {
            if (i === 4) {
                components.push(', ...');
                break;
            }
            if (i > 0) {
                components.push(', ');
            }
            const spanKey = (components.length + 1).toString();
            components.push(nodeValue(data[i], spanKey));
        }
        components.push(' ] - ');

        // add item string
        const key = (components.length + 1).toString();
        components.push(<span key={key} style={itemStringStyle}>{itemString}</span>);

        return components;
    }
    function rootObject(data, itemString) {
        const components = ['{ '] as any[]; // tslint:disable-line:no-any
        let i = 0;
        for (let key in data) {
            if (key !== undefined) {
                if (i++ === 4) {
                    components.push(', ...');
                    break;
                }
                if (i > 1) {
                    components.push(', ');
                }
                const spanKey = (components.length + 1).toString();
                components.push(<span key={spanKey}>{key}: {nodeValue(data[key], key)}</span>);
            }
        }
        components.push(' } - ');

        // add item string
        const spanKey = (components.length + 1).toString();
        components.push(<span key={spanKey} style={itemStringStyle}>{itemString}</span>);

        return components;
    }

    return function(type, data, itemType, itemString) {
        let result = undefined;
        if (type === 'Array') {
            result = rootArray(data, itemString);
        } else if (type === 'Object') {
            result = rootObject(data, itemString);
        } else {
            result = <span>{itemType} {itemString}</span>;
        }
        return result;
    };
})();

interface IJsonTreeProps {
    /*
     * The data to display in the tree.
     */
    data;

    /*
     * The unique ID that represents the data object.
     *
     * An ID is a list of hierarchal "paths" that identifies the element (e.g. ['root', 'nested']).
     */
    elementId: string[];

    forceExpandRoot?: boolean;

    /**
     * The ID of the request associated with the tree.
     */
    requestId: string;
}

function toElementId(parentElementId: string[], keyPath: (string | number)[]): string[] {
    // NOTE: JSONTree's keyPath is stack-like and opposite of what how we store expansion state (so we reverse it).
    return (parentElementId || []).concat(keyPath.map(path => path.toString()).reverse());
}

function mapStateToProps(state: IStoreState, ownProps: IJsonTreeProps) {
    const { data, elementId, forceExpandRoot } = ownProps;

    return {
        data,
        shouldExpandNode: keyPath => {
            return (
                (forceExpandRoot && keyPath.length === 1) ||
                isExpanded(getExpansionState(state), toElementId(elementId, keyPath))
            );
        },
        isNodeExpansionDynamic: true, // JSONTree should always call shouldExpandNode() to determine expansion state
        theme: themeJSONTree,
        invertTheme: false,
        getItemString,
        valueRenderer: (_, value) => {
            if (typeof value === 'string' && /^\[Circular /.test(value)) {
                return <em>Circular</em>;
            } else {
                return value;
            }
        }
    };
}

function mapDispatchToProps(dispatch, ownProps: IJsonTreeProps) {
    const { elementId, requestId } = ownProps;

    return {
        onNodeExpansionChanging: (keyPath, data, level, expanded) => {
            const nodeElementId = toElementId(elementId, keyPath);
            const action = expanded
                ? expandAction(requestId, nodeElementId)
                : collapseAction(requestId, nodeElementId);

            dispatch(action);
        }
    };
}

const JsonTree = connect(mapStateToProps, mapDispatchToProps)(JSONTree); // tslint:disable-line:variable-name

export default JsonTree;



// WEBPACK FOOTER //
// ./src/client/routes/requests/components/JsonTree.tsx