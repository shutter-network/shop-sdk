import { JsonRpcSigner, TransactionRequest, BigNumberish } from 'ethers';
import { ShutterProvider } from './provider-shutter';
export declare class SignerShutter extends JsonRpcSigner {
    constructor(provider: ShutterProvider, address: string);
    isShutterPaused(): Promise<boolean>;
    getEonKey(blockNumber: number): Promise<string>;
    encryptOriginalTx(_tx: TransactionRequest): Promise<[Uint8Array, BigNumberish]>;
    sendTransaction(tx: TransactionRequest): Promise<any>;
}
//# sourceMappingURL=signer-shutter.d.ts.map