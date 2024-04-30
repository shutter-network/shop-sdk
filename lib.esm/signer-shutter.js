'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.SignerShutter = void 0
const ethers_1 = require('ethers')
const Inbox_json_1 = require('./abis/Inbox.sol/Inbox.json')
const KeyperSetManager_json_1 = require('./abis/KeyperSetManager.sol/KeyperSetManager.json')
const KeyBroadcastContract_json_1 = require('./abis/KeyBroadcastContract.sol/KeyBroadcastContract.json')
const shutter_crypto_1 = require('@shutter-network/shutter-crypto')
const ethers_2 = require('ethers')
const Primitive = 'bigint,boolean,function,number,string,symbol'.split(/,/g)
function deepCopy(value) {
  if (value == null || Primitive.indexOf(typeof value) >= 0) {
    return value
  }
  // Keep any Addressable
  if (typeof value.getAddress === 'function') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map(deepCopy)
  }
  if (typeof value === 'object') {
    return Object.keys(value).reduce((accum, key) => {
      accum[key] = value[key]
      return accum
    }, {})
  }
  throw new Error(`should not happen: ${value} (${typeof value})`)
}
class SignerShutter extends ethers_1.JsonRpcSigner {
  constructor(provider, address) {
    super(provider, address)
    this.wasmUrl = provider.wasmUrl
    this.keyperSetManagerAddress = (0, ethers_2.getAddress)(
      provider.keyperSetManagerAddress,
    )
    this.inboxAddress = (0, ethers_2.getAddress)(provider.inboxAddress)
    this.keyBroadcastAddress = (0, ethers_2.getAddress)(
      provider.keyBroadcastAddress,
    )
  }
  isShutterPaused() {
    return __awaiter(this, void 0, void 0, function* () {
      const keyperSet = new ethers_1.Contract(
        this.keyperSetManagerAddress,
        KeyperSetManager_json_1.abi,
        this.provider,
      )
      const inbox = new ethers_1.Contract(
        this.inboxAddress,
        Inbox_json_1.abi,
        this.provider,
      )
      const result = yield Promise.all([
        inbox.paused(),
        keyperSet.paused(),
      ]).then(([inboxPaused, keyperSetPaused]) => {
        return inboxPaused || keyperSetPaused
      })
      return result
    })
  }
  getCurrentEonKey() {
    return __awaiter(this, void 0, void 0, function* () {
      const blockNumber = yield this.provider.getBlockNumber()
      return this.getEonKeyForBlock(blockNumber)
    })
  }
  getEonKeyForBlock(block) {
    return __awaiter(this, void 0, void 0, function* () {
      const eon = yield this.getEonForBlock(block)
      return this.getEonKey(eon)
    })
  }
  getEonForBlock(block) {
    return __awaiter(this, void 0, void 0, function* () {
      const keyperSetManager = new ethers_1.Contract(
        this.keyperSetManagerAddress,
        KeyperSetManager_json_1.abi,
        this.provider,
      )
      return keyperSetManager.getKeyperSetIndexByBlock(block)
    })
  }
  getEonKey(eon) {
    return __awaiter(this, void 0, void 0, function* () {
      const keyBroadcastContract = new ethers_1.Contract(
        this.keyBroadcastAddress,
        KeyBroadcastContract_json_1.abi,
        this.provider,
      )
      const result = yield keyBroadcastContract.getEonKey(eon)
      return result
    })
  }
  hexKeyToArray(hexvalue) {
    return Uint8Array.from(Buffer.from(hexvalue, 'hex'))
  }
  decodeExecutionReceipt(receipt) {
    return (0, ethers_1.decodeRlp)(receipt)
  }
  encryptOriginalTx(_tx, inclusionBlock) {
    return __awaiter(this, void 0, void 0, function* () {
      const tx = deepCopy(_tx)
      const promises = []
      // Make sure the from matches the sender
      if (tx.from) {
        const _from = tx.from
        promises.push(
          (() =>
            __awaiter(this, void 0, void 0, function* () {
              const from = yield (0, ethers_1.resolveAddress)(
                _from,
                this.provider,
              )
              ;(0, ethers_1.assertArgument)(
                from != null &&
                  from.toLowerCase() === this.address.toLowerCase(),
                'from address mismatch',
                'transaction',
                _tx,
              )
              tx.from = from
            }))(),
        )
      } else {
        tx.from = this.address
      }
      // The JSON-RPC for eth_sendTransaction uses 90000 gas; if the user
      // wishes to use this, it is easy to specify explicitly, otherwise
      // we look it up for them.
      if (tx.gasLimit == null) {
        promises.push(
          (() =>
            __awaiter(this, void 0, void 0, function* () {
              tx.gasLimit = yield this.provider.estimateGas(
                Object.assign(Object.assign({}, tx), { from: this.address }),
              )
            }))(),
        )
      }
      // The address may be an ENS name or Addressable
      if (tx.to != null) {
        const _to = tx.to
        promises.push(
          (() =>
            __awaiter(this, void 0, void 0, function* () {
              tx.to = yield (0, ethers_1.resolveAddress)(_to, this.provider)
            }))(),
        )
      }
      // Wait until all of our properties are filled in
      if (promises.length) {
        yield Promise.all(promises)
      }
      const eonKey = yield this.getEonKeyForBlock(inclusionBlock)
      console.log('inclusion block/epoch', inclusionBlock)
      yield (0, shutter_crypto_1.init)(this.wasmUrl)
      if (!tx.data) {
        tx.data = '0x'
      }
      const dataForShutterTX = [
        tx.to,
        tx.data,
        (0, ethers_1.toBeArray)(BigInt(tx.value)),
      ]
      console.log('tx.value', dataForShutterTX[-1])
      console.log('rlp', (0, ethers_1.encodeRlp)(dataForShutterTX))
      const sigma = new Uint8Array(32)
      // FIXME: is this the right way to obtain sigma?
      window.crypto.getRandomValues(sigma)
      const epochId = (0, ethers_1.toBeHex)(inclusionBlock)
      const dataBytes = (0, ethers_1.getBytes)(
        (0, ethers_1.encodeRlp)(dataForShutterTX),
      )
      const versionedData = new Uint8Array(dataBytes.length + 1)
      // version byte needs to be 0
      versionedData.set(dataBytes, 1)
      var encryptedMessage
      try {
        encryptedMessage = yield (0, shutter_crypto_1.encrypt)(
          versionedData,
          (0, ethers_1.getBytes)(eonKey),
          (0, ethers_1.getBytes)(epochId),
          sigma,
        )
      } catch (error) {
        console.log(error)
      }
      return [encryptedMessage, tx.gasLimit]
    })
  }
  _sendTransactionTrace(tx, inclusionWindow = 17, blockProvider) {
    const _super = Object.create(null, {
      sendTransaction: { get: () => super.sendTransaction },
    })
    return __awaiter(this, void 0, void 0, function* () {
      console.log(inclusionWindow)
      const isPaused = yield this.isShutterPaused()
      if (isPaused) {
        throw new Error('shutter is paused')
      }
      if (!blockProvider) {
        blockProvider = this.provider
      }
      const latestBlock = yield blockProvider.getBlock('latest')
      if (latestBlock == null) {
        throw new Error('latest block not found')
      }
      const executionBlock = latestBlock.number + inclusionWindow
      const inbox = new ethers_1.Contract(
        this.inboxAddress,
        Inbox_json_1.abi,
        this,
      )
      const [executionTx, gasLimitExecuteTx] = yield this.encryptOriginalTx(
        tx,
        executionBlock,
      )
      const includeTx =
        yield inbox.submitEncryptedTransaction.populateTransaction(
          executionBlock,
          executionTx,
          gasLimitExecuteTx,
          tx.from,
        )
      // gasLimitExecuteTx should be some % higher, because the execution of the tx will
      // happen several blocks later, and the gasLimit is estimated for the current
      // block.
      const txFeesForExecutionTx =
        latestBlock.baseFeePerGas *
        ((BigInt(gasLimitExecuteTx) * BigInt(120)) / BigInt(100))
      includeTx.value = txFeesForExecutionTx
      console.log(includeTx)
      return new Promise((resolve, reject) => {
        resolve([
          executionTx,
          _super.sendTransaction.call(this, includeTx),
          executionBlock,
        ])
      })
    })
  }
  sendTransaction(tx) {
    return __awaiter(this, void 0, void 0, function* () {
      return (yield this._sendTransactionTrace(tx, 25))[1]
    })
  }
}
exports.SignerShutter = SignerShutter
//# sourceMappingURL=signer-shutter.js.map
