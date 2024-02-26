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
exports.ShutterProvider = void 0
const ethers_1 = require('ethers')
const signer_shutter_1 = require('./signer-shutter')
class ShutterProvider extends ethers_1.BrowserProvider {
  constructor(shutterOptions, ethereum, network) {
    super(ethereum, network)
    this.wasmUrl = shutterOptions.wasmUrl
    this.keyperSetManagerAddress = (0, ethers_1.getAddress)(
      shutterOptions.keyperSetManagerAddress,
    )
    this.inboxAddress = (0, ethers_1.getAddress)(shutterOptions.inboxAddress)
    this.keyBroadcastAddress = (0, ethers_1.getAddress)(
      shutterOptions.keyBroadcastAddress,
    )
  }
  getSigner(address) {
    return __awaiter(this, void 0, void 0, function* () {
      if (address == null) {
        address = 0
      }
      const accountsPromise = this.send('eth_accounts', [])
      // Account index
      if (typeof address === 'number') {
        const accounts = yield accountsPromise
        if (address >= accounts.length) {
          throw new Error('no such account')
        }
        return new signer_shutter_1.SignerShutter(this, accounts[address])
      }
      const { accounts } = yield (0, ethers_1.resolveProperties)({
        network: this.getNetwork(),
        accounts: accountsPromise,
      })
      // Account address
      address = (0, ethers_1.getAddress)(address)
      for (const account of accounts) {
        if ((0, ethers_1.getAddress)(account) === address) {
          return new signer_shutter_1.SignerShutter(this, address)
        }
      }
      throw new Error('invalid account')
    })
  }
}
exports.ShutterProvider = ShutterProvider
//# sourceMappingURL=provider-shutter.js.map
