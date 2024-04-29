import { BrowserProvider, Eip1193Provider, Networkish } from 'ethers'
import { SignerShutter } from './signer-shutter'
import { currentEnv, EnvSpecificArg } from './types'
type ShutterOptions = {
  wasmUrl: EnvSpecificArg<typeof currentEnv>
  keyperSetManagerAddress: string
  inboxAddress: string
  keyBroadcastAddress: string
}
export declare class ShutterProvider extends BrowserProvider {
  wasmUrl: EnvSpecificArg<typeof currentEnv>
  keyperSetManagerAddress: string
  inboxAddress: string
  keyBroadcastAddress: string
  constructor(
    shutterOptions: ShutterOptions,
    ethereum: Eip1193Provider,
    network?: Networkish,
  )
  getSigner(address?: number | string): Promise<SignerShutter>
}
export {}
//# sourceMappingURL=provider-shutter.d.ts.map
