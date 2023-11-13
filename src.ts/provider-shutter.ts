import {
  getAddress,
  JsonRpcProvider,
  resolveProperties,
  JsonRpcApiProviderOptions,
  Networkish,
  FetchRequest
} from 'ethers'
import { SignerShutter } from './signer-shutter'
import { currentEnv, EnvSpecificArg } from './types'



type ShutterOptions = {
  wasmUrl: EnvSpecificArg<typeof currentEnv>,
  keyperSetManagerAddress: string,
  inboxAddress: string,
  keyBroadcastAddress: string
}
export class ShutterProvider extends JsonRpcProvider {

  wasmUrl: EnvSpecificArg<typeof currentEnv>;
  keyperSetManagerAddress: string;
  inboxAddress: string;
  keyBroadcastAddress: string;

  constructor(shutterOptions: ShutterOptions, url?: string | FetchRequest, network?: Networkish, options?: JsonRpcApiProviderOptions) {
    super(url, network, options)

    this.wasmUrl = shutterOptions.wasmUrl;
    this.keyperSetManagerAddress = getAddress(shutterOptions.keyperSetManagerAddress);
    this.inboxAddress = getAddress(shutterOptions.inboxAddress);
    this.keyBroadcastAddress = getAddress(shutterOptions.keyBroadcastAddress);
  }

  async getSigner(address?: number | string): Promise<SignerShutter> {
    if (address == null) { address = 0; }

    const accountsPromise = this.send("eth_accounts", [ ]);

    // Account index
    if (typeof(address) === "number") {
      const accounts = <Array<string>>(await accountsPromise);
      if (address >= accounts.length) { throw new Error("no such account"); }
      return new SignerShutter(this, accounts[address]);
    }

    const { accounts } = await resolveProperties({
      network: this.getNetwork(),
      accounts: accountsPromise
    });

    // Account address
    address = getAddress(address);
    for (const account of accounts) {
      if (getAddress(account) === address) {
        return new SignerShutter(this, address)
      }
    }

    throw new Error("invalid account");
  }
}
