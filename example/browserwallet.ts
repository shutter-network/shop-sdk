import {
  ShutterProvider,
  ethers,
  init,
  decrypt,
} from '@shutter-network/shop-sdk'

// shutter specific constants
const options = {
  // path to the WASM library
  wasmUrl: '/shutter-crypto.wasm',
  // contract address to query the current keyper set
  keyperSetManagerAddress: '0x4200000000000000000000000000000000000067',
  // target address for encrypted transactions
  inboxAddress: '0x4200000000000000000000000000000000000066',
  // contract address to query encryption keys
  keyBroadcastAddress: '0x4200000000000000000000000000000000000068',
}

// initialize shutter WASM library
await init(options.wasmUrl)

// setup `signer` and `provider` (c.f. https://docs.ethers.org/v6/getting-started/#starting-connecting)
// shutter specific steps are highlighted as `SHUTTER>`
let signer = null

let provider
if (window.ethereum == null) {
  // If MetaMask is not installed, we use the default provider,
  // which is backed by a variety of third-party services (such
  // as INFURA). They do not have private keys installed,
  // so they only have read-only access
  console.log('MetaMask not installed; using read-only defaults')
  provider = ethers.getDefaultProvider()
} else {
  // Connect to the MetaMask EIP-1193 object. This is a standard
  // protocol that allows Ethers access to make all read-only
  // requests through MetaMask.
  // SHUTTER> use ShutterProvider
  provider = new ShutterProvider(options, window.ethereum)

  // It also provides an opportunity to request access to write
  // operations, which will be performed by the private key
  // that MetaMask manages for the user.
  signer = await provider.getSigner()
}

// now that we have a signer, we can send an encrypted transaction

// transaction parameters
let txRequest = {
  from: signer.address,
  to: signer.address,
  value: 1,
  data: '0x',
}

// send transaction with standard settings
const txResponse = await signer.sendTransaction(txRequest)

// this is equivalent to calling
/*
 * const inclusionWindow = 25; // default inclusionWindow
 * const [
 *     encryptedMessage,
 *     txResponse,
 *     scheduledExecutionBlock
 * ] = await signer._sendTransactionTrace(
 *     txRequest,
 *     inclusionWindow
 * )
 */

// ShutterSigner will automatically
// - query the encryption parameters
// - schedule an execution block based on the inclusionWindow parameter
//   `scheduledExecutionBlock = latestBlock + inclusionWindow`
// - encrypt the original transaction
// - estimate the necessary gas
// - prepare a transaction to the InboxContract
// - trigger the user interaction for signing

// IMPORTANT: if the user does not sign the transaction in time to be included
// before `scheduledExecutionBlock`, the transaction __will__ fail.

// wait for the inboxTransaction to be mined:
await txResponse.wait()

// wait for the execution block, then check the result:
let blockdata = await provider.getBlock(scheduledExecutionBlock, true)
let txHash = blockdata.getPrefetchedTransaction(0).hash
let receipt = await provider.getTransactionReceipt(txHash)
let executionLog = receipt.logs[receipt.logs.length - 1].data

// the executionLog contains the decryptionKey
let [decryptionKey, executions] = ethers.decodeRlp(executionLog)

// check that the included transaction corresponds to txRequest
let decrypted = await decrypt(
  Uint8Array.from(Buffer.from(encryptedMessage, 'hex')),
  Uint8Array.from(Buffer.from(decryptionKey.slice(2), 'hex')),
)
const [to, data, value] = ethers.decodeRlp(
  '0x' + Buffer.from(decrypted.slice(1)).toString('hex'),
)
console.log([
  txRequest.to == to,
  txRequest.data == data,
  txRequest.value == parseInt(value, 16),
])

// executions contains an array with status information for all shutterized transactions
// in the block

executions.map(execution => {
  let [status, gasUsed, logNumber] = execution
  let success = status == '0x64'
  console.log(
    `${logNumber} successful: ${success} (${status}) gas used ${gasUsed}`,
  )
})
