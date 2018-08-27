import { AgentType } from './TimelineInterfaces';

export function convertStringToAgentType(val: string): AgentType {
    let t = AgentType.Other;
    if (val === 'server') {
        t = AgentType.Server;
    } else if (val === 'browser') {
        t = AgentType.Browser;
    }
    return t;
}



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/timeline/TimelineUtils.ts