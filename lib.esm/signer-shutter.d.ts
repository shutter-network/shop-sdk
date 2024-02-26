import { JsonRpcSigner, TransactionRequest, BigNumberish } from 'ethers';
import { ShutterProvider } from './provider-shutter';
import { currentEnv, EnvSpecificArg } from './types';
export declare class SignerShutter extends JsonRpcSigner {
    wasmUrl: EnvSpecificArg<typeof currentEnv>;
    keyperSetManagerAddress: string;
    inboxAddress: string;
    keyBroadcastAddress: string;
    constructor(provider: ShutterProvider, address: string);
    isShutterPaused(): Promise<boolean>;
    getCurrentEonKey(): Promise<string>;
    getEonKeyForBlock(block: number): Promise<string>;
    getEonForBlock(block: number): Promise<number>;
    getEonKey(eon: number): Promise<string>;
    hexKeyToArray(hexvalue: string): Uint8Array;
    decodeExecutionReceipt(receipt: string): any;
    encryptOriginalTx(_tx: TransactionRequest, inclusionBlock: number): Promise<[Uint8Array, BigNumberish]>;
    _sendTransactionTrace(tx: TransactionRequest, inclusionWindow: number): Promise<any>;
    sendTransaction(tx: TransactionRequest): Promise<any>;
}
//# sourceMappingURL=signer-shutter.d.ts.map