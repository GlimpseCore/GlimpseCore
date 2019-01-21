declare const PRODUCTION: boolean;
declare const GLIMPSE_VERSION: string;
declare const DEBUG: boolean;
declare const FAKE_SERVER: boolean;
declare const HOT_RELOAD: boolean;

declare module '*.scss' {
    const content: {[className: string]: string};
    export default content;
}