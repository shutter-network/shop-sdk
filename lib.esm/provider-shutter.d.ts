import { JsonRpcApiProvider } from "ethers";
import type { JsonRpcError, JsonRpcPayload, JsonRpcResult } from "ethers";
export declare class ShutterProvider extends JsonRpcApiProvider {
    _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>>;
}
//# sourceMappingURL=provider-shutter.d.ts.map