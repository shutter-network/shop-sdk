import {
  Contract,
  JsonRpcSigner,
  TransactionRequest,
  getBytes,
  encodeRlp,
  RlpStructuredDataish,
  toBeHex, zeroPadValue, resolveAddress, assertArgument, BigNumberish
} from 'ethers'
import { abi as InboxAbi } from './abis/Inbox.sol/Inbox.json'
import { abi as KeyperSetManager } from './abis/KeyperSetManager.sol/KeyperSetManager.json'
import { abi as KeyBroadcastContract } from './abis/KeyBroadcastContract.sol/KeyBroadcastContract.json'
import { ShutterProvider } from './provider-shutter'

import { encrypt, init } from '@shutter-network/shutter-crypto'
import { getAddress } from 'ethers'
import { currentEnv, EnvSpecificArg } from './types'

const Primitive = "bigint,boolean,function,number,string,symbol".split(/,/g);
function deepCopy<T = any>(value: T): T {
  if (value == null || Primitive.indexOf(typeof(value)) >= 0) {
    return value;
  }

  // Keep any Addressable
  if (typeof((<any>value).getAddress) === "function") {
    return value;
  }

  if (Array.isArray(value)) { return <any>(value.map(deepCopy)); }

  if (typeof(value) === "object") {
    return Object.keys(value).reduce((accum, key) => {
      accum[key] = (<any>value)[key];
      return accum;
    }, <any>{ });
  }

  throw new Error(`should not happen: ${ value } (${ typeof(value) })`);
}

export class SignerShutter extends JsonRpcSigner {
  wasmUrl: EnvSpecificArg<typeof currentEnv>;
  keyperSetManagerAddress: string;
  inboxAddress: string;
  keyBroadcastAddress: string;

  constructor(provider: ShutterProvider, address: string) {
    super(provider, address)

    this.wasmUrl = provider.wasmUrl;
    this.keyperSetManagerAddress = getAddress(provider.keyperSetManagerAddress);
    this.inboxAddress = getAddress(provider.inboxAddress);
    this.keyBroadcastAddress = getAddress(provider.keyBroadcastAddress);
  }

  async isShutterPaused(): Promise<boolean> {
    const keyperSet = new Contract(this.keyperSetManagerAddress, KeyperSetManager, this.provider)
    const inbox = new Contract(this.inboxAddress, InboxAbi, this.provider)
    const result = await Promise.all([inbox.paused(), keyperSet.paused()]).then(([inboxPaused, keyperSetPaused]) => {
      return inboxPaused || keyperSetPaused
    })
    return result
  }

  async getCurrentEonKey(): Promise<string> {
      const blockNumber = await this.provider.getBlockNumber()
      return this.getEonKeyForBlock(blockNumber)
  }

  async getEonKeyForBlock(block: number): Promise<string> {
      const eon = await this.getEonForBlock(block);
      return this.getEonKey(eon)
  }

  async getEonForBlock(block: number): Promise<number> {
      const keyperSetManager = new Contract(this.keyperSetManagerAddress, KeyperSetManager, this.provider)
      return keyperSetManager.getKeyperSetIndexByBlock(block);
  }

  async getEonKey(eon: number): Promise<string> {
    const keyBroadcastContract = new Contract(this.keyBroadcastAddress, KeyBroadcastContract, this.provider)
    const result = await keyBroadcastContract.getEonKey(eon)
    return result
  }

  async encryptOriginalTx(_tx: TransactionRequest): Promise<[Uint8Array, BigNumberish]> {
    const tx = deepCopy(_tx)

    const promises: Array<Promise<void>> = []

    // Make sure the from matches the sender
    if (tx.from) {
      const _from = tx.from
      promises.push((async () => {
        const from = await resolveAddress(_from, this.provider)
        assertArgument(from != null && from.toLowerCase() === this.address.toLowerCase(),
          'from address mismatch', 'transaction', _tx)
        tx.from = from
      })())
    } else {
      tx.from = this.address
    }

    // The JSON-RPC for eth_sendTransaction uses 90000 gas; if the user
    // wishes to use this, it is easy to specify explicitly, otherwise
    // we look it up for them.
    if (tx.gasLimit == null) {
      promises.push((async () => {
        tx.gasLimit = await this.provider.estimateGas({ ...tx, from: this.address })
      })())
    }

    // The address may be an ENS name or Addressable
    if (tx.to != null) {
      const _to = tx.to
      promises.push((async () => {
        tx.to = await resolveAddress(_to, this.provider)
      })())
    }

    // Wait until all of our properties are filled in
    if (promises.length) {
      await Promise.all(promises)
    }


    const blockNumber = await this.provider.getBlockNumber()

    const eonKey = await this.getEonKeyForBlock(blockNumber + 2)
    console.log(blockNumber + 2)

    await init(this.wasmUrl)

    const dataForShutterTX = [tx.to, toBeHex(BigInt(tx.value as string))]
    const sigma = new Uint8Array(32)
    const epochId = toBeHex(blockNumber + 2)
    const encryptedMessage = await encrypt(
      getBytes(encodeRlp(dataForShutterTX as RlpStructuredDataish)),
      getBytes(eonKey),
      getBytes(zeroPadValue(epochId, 32)),
      sigma
    )

    return [encryptedMessage, tx.gasLimit!]
  }

  async sendTransaction(tx: TransactionRequest): Promise<any> {
    const isPaused = await this.isShutterPaused()

    if (isPaused) {
      throw new Error('shutter is paused')
    }

    const latestBlock = await this.provider.getBlock("latest");

    if (latestBlock == null) {
      throw new Error('latest block not found')
    }

    const inbox = new Contract(this.inboxAddress, InboxAbi, this)
    const [executionTx, gasLimitExecuteTx] = await this.encryptOriginalTx(tx)
    const includeTx = await inbox.submitEncryptedTransaction.populateTransaction(latestBlock.number + 2, executionTx, gasLimitExecuteTx, tx.to)

    // gasLimitExecuteTx should be some % higher, because the execution of the tx will
    // happen several blocks later, and the gasLimit is estimated for the current
    // block.
    const txFeesForExecutionTx = latestBlock.baseFeePerGas! * ((BigInt(gasLimitExecuteTx) * BigInt(120)) / BigInt(100))

    includeTx.value = txFeesForExecutionTx
    return super.sendTransaction(includeTx)
  }
}
