// tslint:disable-next-line:no-unused-variable
import React from 'react';
import { redisDocs } from '@common/docs/redis';
import commonStyles from '@common/components/Common.scss';
import styles from './RedisCommandDocs.scss';

interface IRedisDocsArgument {
    name?: string | string[];
    type: string | string[];
    command?: string;
    optional?: boolean;
    variadic?: boolean;
    multiple?: boolean;
    enum?: string[];
}

interface IRedisDocsRecord {
    summary: string;
    complexity: string;
    since: string;
    group: string;
    arguments: IRedisDocsArgument[];
}

interface IRedisCommandDocs {
    command: string;
}

/**
 * getRedisWebisteLink - function to create Redis docs website link.
 *
 * @param {String} command Redis command.
 * @return {String} Lint to the command docs.
 */
export const getRedisWebisteLink = (command: string): string => {
    // lowercase it + remove pad spaces + replace spaces to dashes
    let commandRoute = command.toLowerCase().trim().replace(/\s/gim, '-');

    return `https://redis.io/commands/${commandRoute}`;
};

/**
 * getDocsCommandArgumentsString - function to render `Redis` command string.
 */
export const getDocsCommandArgumentsString = (args: IRedisDocsArgument[]): string => {
    // if there is not `arguments`, return an emtoy string
    if (args === undefined) {
        return '';
    }

    let result = '';
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        let name = arg.name;
        // if type of arguments is `enum` use the `enum` instead of name
        if (arg.type === 'enum') {
            name = arg.enum.join('|');
        } else {
            // check if name is an `array`, if so `join` it with spaces
            name = typeof arg.name === 'string' ? arg.name : arg.name.join(' ');
        }
        //
        const command = arg.command || '';
        const variadic = arg.variadic ? `[${name} ...]` : '';
        // `command` and `name` are commonly placed together, create a fusion of them
        const commandNameSpace = command ? ' ' : '';
        const commandAndName = `${command}${commandNameSpace}${name}`;
        // if the argument is multiple, wrap it into `[command name ...]`
        const multiple = arg.multiple === true
            ? `[${commandAndName} ...]${arg.optional ? '' : ' '}`
            : '';
        // finaly reneder the argument
        let argument = `${commandAndName} ${multiple}${variadic}`;
        // if the argument is optinal - wrap it with `[]`
        if (arg.optional) {
            argument = `[${argument.trim()}] `;
        }
        // add the argument to the result
        result += argument;
    }

    return result.trim();
};

// tslint:disable-next-line:variable-name
export const RedisCommandDocs = (props: IRedisCommandDocs): JSX.Element => {
    const { command } = props;
    const docs: IRedisDocsRecord = redisDocs[command.toUpperCase()];

    // if docs not found, skip rendering the component
    if (docs === undefined) {
        return null; // tslint:disable-line:no-null-keyword
    }

    const args = getDocsCommandArgumentsString(docs.arguments);
    const link = getRedisWebisteLink(command);

    return (
        <div className={styles.comments}>
            <pre>
                {'/**'}
                {'\n *'} {command} {args}
                {docs.summary && `\n * ${docs.summary}.`}
                {docs.since && `\n\n * Available since: ${docs.since}`}
                {docs.complexity && `\n * Time complexity: ${docs.complexity}`}
                {`\n * Docs: `}
                <a href={link} target="_blank" className={commonStyles.link}>{link}</a>
                {'\n */'}
            </pre>
        </div>
    );
};



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/RedisCommandDocs.tsx