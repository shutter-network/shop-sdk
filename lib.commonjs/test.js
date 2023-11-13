"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const ganache_1 = __importDefault(require("ganache"));
const index_js_1 = require("./index.js");
// async function test(provider: ShutterProvider): Promise<void> {
//   console.log("PROVIDER", provider);
//   console.log("BLOCK NUMBER", await provider.getBlockNumber());
//
//   // const signer = await provider.getSigner();
//   // console.log("SIGNER", signer);
//   //
//   // const wallet = new ethers.Wallet(ethers.id("foo"), provider);
//   // console.log("WALLET", wallet);
//   //
//   // {
//   //   const tx = await signer.sendTransaction({ to: wallet, value: "123000000000000" });
//   //   console.log("TX1", tx);
//   //   console.log("RECEIPT1", await tx.wait());
//   // }
//   //
//   // {
//   //   const tx = await wallet.sendTransaction({ to: signer, value: 123 });
//   //   console.log("TX2", tx);
//   //   console.log("RECEIPT2", await tx.wait());
//   // }
// }
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = (ganache_1.default.provider({ chain: { chainId: 1336 } }));
        console.log(provider, provider.getOptions());
        const network = new ethers_1.Network("testnet", provider.getOptions().chain.chainId);
        console.log('network', network.toJSON());
        new index_js_1.ShutterProvider('', network);
        // super(network, {
        //   staticNetwork: network,
        //   batchMaxCount: 1,
        //   batchStallTime: 0,
        //   cacheTimeout: -1
        // });
        //
        // await test(new ShutterProvider('', network));
        // await test(new ShutterProvider({ chain: { chainId: 13370 } }));
    });
})();
//# sourceMappingURL=test.js.map