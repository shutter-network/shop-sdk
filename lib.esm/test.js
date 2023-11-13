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
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
// import { ethers, ContractFactory, JsonRpcProvider, Wallet } from 'ethers'
// import ganache from "ganache";
// import hardhat from "hardhat";
// import {hre} from "hardhat"
const index_js_1 = require("./index.js");
// import { abi, bytecode } from "./abis/Inbox.sol/Inbox.json";
function test(provider) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log("PROVIDER", provider);
        console.log("BLOCK NUMBER", yield provider.getBlockNumber());
        const signer = yield provider.getSigner();
        // console.log("SIGNER", signer);
        //
        const wallet = new ethers_1.ethers.Wallet(ethers_1.ethers.id("foo"), provider);
        console.log("WALLET", wallet);
        {
            const tx = yield signer.sendTransaction({ to: wallet, value: "123000000000000" });
            console.log("TX1", tx);
            console.log("RECEIPT1", yield tx.wait());
        }
        //
        // {
        //   const tx = await wallet.sendTransaction({ to: signer, value: 123 });
        //   console.log("TX2", tx);
        //   console.log("RECEIPT2", await tx.wait());
        // }
    });
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const jsonProvider = new ethers_1.JsonRpcProvider('http://127.0.0.1:8545');
        yield jsonProvider.send("evm_setAutomine", [true]);
        yield jsonProvider.send("evm_mine", []);
        // const wallet = new Wallet( "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", jsonProvider);
        // const factory = new ContractFactory(abi, bytecode.object, wallet);
        // const contract = await factory.deploy("1000000");
        //
        // const inboxAddress = await contract.getAddress();
        // const inboxAddress = "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9";
        // deployer is: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        // Inbox deployed at: 0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc
        // KeyperSet deployed at: 0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f
        // KeyBroadcaster set to deployer's address
        // KeyperSet finalized
        // KeyperSetManager deployed at: 0x922D6956C99E12DFeB3224DEA977D0939758A1Fe
        // KeyperSet added to KeyperSetManager with activation block: 130
        // KeyBroadcastContract deployed at: 0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d
        // Eon key broadcasted for eon 0
        yield test(new index_js_1.ShutterProvider({
            wasmUrl: '',
            keyperSetManagerAddress: '0x922D6956C99E12DFeB3224DEA977D0939758A1Fe',
            inboxAddress: '0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc',
            keyBroadcastAddress: '0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d'
        }, 'http://127.0.0.1:8545'));
        // await test(new ShutterProvider({ chain: { chainId: 13370 } }));
    });
})();
//# sourceMappingURL=test.js.map