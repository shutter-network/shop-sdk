import { JsonRpcProvider, JsonRpcApiProviderOptions, Networkish, FetchRequest } from 'ethers';
import { SignerShutter } from './signer-shutter';
type BrowserEnv = 'browser';
type NodeEnv = 'node';
declare const currentEnv: BrowserEnv | NodeEnv;
type EnvSpecificArg<T> = T extends BrowserEnv ? string : never;
type ShutterOptions = {
    wasmUrl: EnvSpecificArg<typeof currentEnv>;
    keyperSetManagerAddress: string;
    inboxAddress: string;
    keyBroadcastAddress: string;
};
export declare class ShutterProvider extends JsonRpcProvider {
    wasmUrl: EnvSpecificArg<typeof currentEnv>;
    keyperSetManagerAddress: string;
    inboxAddress: string;
    keyBroadcastAddress: string;
    constructor(shutterOptions: ShutterOptions, url?: string | FetchRequest, network?: Networkish, options?: JsonRpcApiProviderOptions);
    getSigner(address?: number | string): Promise<SignerShutter>;
}
export {};
//# sourceMappingURL=provider-shutter.d.ts.map