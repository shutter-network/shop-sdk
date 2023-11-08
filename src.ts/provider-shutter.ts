import {
  JsonRpcApiProvider
} from 'ethers'

import type {
  JsonRpcError, JsonRpcPayload, JsonRpcResult
} from 'ethers'

export class ShutterProvider extends JsonRpcApiProvider {

  async _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>> {

    return []
  }
}
