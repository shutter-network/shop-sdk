export type BrowserEnv = 'browser';
export type NodeEnv = 'node';
export declare const currentEnv: BrowserEnv | NodeEnv;

export type EnvSpecificArg<T> = T extends BrowserEnv ? string : never;
