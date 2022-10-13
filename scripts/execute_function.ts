import { ethers } from "hardhat";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import fs from "fs";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/abstract-provider";

// Script input parameters
const contractName: string = process.env.SP_CONTRACT_NAME || "ContractA";
const contractAddress: string = process.env.SP_CONTRACT_ADDRESS || "0xbd030c78c38E977BCb41d783b88A1f02c07124C8";
const functionName: string = process.env.SP_FUNCTION_NAME || "setX";
const functionArgument: string = process.env.SP_FUNCTION_ARGUMENT || "123";
const nonce: string = process.env.SP_NONCE || "auto";
const gasLimit: string = process.env.SP_GAS_LIMIT || "auto";
const saveToFile: boolean = (process.env.SP_SAVE_TO_FILE || "true").toLowerCase() === "true";

// Script constants
const jsonIndent = 2;

// Script variables
let contractFactory: ContractFactory;
let contract: Contract;
let deployer: SignerWithAddress;

async function defineNonce(): Promise<number> {
  if (nonce.toLowerCase() === "auto") {
    return await ethers.provider.getTransactionCount(deployer.address);
  }
  return parseInt(nonce);
}

function demonstrateGasLimitRequestingError(e: any) {
  if (saveToFile) {
    const filePath: string = "gas_limit_request_error.txt";
    fs.writeFileSync(filePath, JSON.stringify(e, Object.getOwnPropertyNames(e), jsonIndent));
    console.log("The error saved to file: " + filePath + ".");
  } else {
    console.log("The error:\n", e);
  }
}

async function defineGasLimit(tx: any): Promise<BigNumber> {
  let txGasLimit: BigNumber;

  if (gasLimit.toLowerCase() === "auto") {
    console.log(`Requesting the gas limit from the blockchain ...`);
    try {
      txGasLimit = await deployer.estimateGas(tx);
    } catch (e) {
      console.log(`❌ Requesting gas limit failed.`);
      demonstrateGasLimitRequestingError(e);
      process.exit(1);
    }
    console.log(`✅ Gas limit has been successfully requested.`);
  } else {
    txGasLimit = BigNumber.from(gasLimit);
  }
  console.log("Gas limit for the transaction:", txGasLimit.toString());
  return txGasLimit;
}

function demonstrateTxResponse(txResponse: TransactionResponse) {
  if (saveToFile) {
    const filePath: string = "tx_response_" + txResponse.hash;
    fs.writeFileSync(filePath, JSON.stringify(txResponse, null, jsonIndent));
    console.log("The transaction response has been saved to file: " + filePath + ".");
  } else {
    console.log("Transaction response:\n", txResponse);
  }
}

function demonstrateTxReceipt(txReceipt: TransactionReceipt) {
  if (saveToFile) {
    const filePath: string = "tx_receipt_" + txReceipt.transactionHash;
    fs.writeFileSync(filePath, JSON.stringify(txReceipt, null, jsonIndent));
    console.log("The transaction receipt has been saved to file: " + filePath + ".");
  } else {
    console.log("Transaction receipt:\n", txReceipt);
  }
}

function demonstrateTxMintingErr(e: any, txResponse: TransactionResponse) {
  if (saveToFile) {
    const filePath: string = "tx_minting_error_" + txResponse.hash + ".txt";
    fs.writeFileSync(filePath, JSON.stringify(e, Object.getOwnPropertyNames(e), jsonIndent));
    console.log("The error saved to file: " + filePath + ".");
  } else {
    console.log("The error:\n", e);
  }
}

async function main() {
  [deployer] = await ethers.getSigners();

  console.log(`Contract '${contractName}'. Executing function '${functionName}(${functionArgument})'...`);
  contractFactory = await ethers.getContractFactory(contractName);
  contract = contractFactory.attach(contractAddress);

  const data = contract.interface.encodeFunctionData(functionName, [functionArgument]);
  const txNonce = await defineNonce();
  console.log("Nonce:", txNonce);
  console.log("Data:", data);

  const tx: any = {
    to: contract.address,
    data: data,
  };
  tx.gasLimit = await defineGasLimit(tx);
  tx.nonce = txNonce;

  console.log("Sending the transaction...");
  const txResponse: TransactionResponse = await deployer.sendTransaction(tx);
  console.log("✅ The transaction has been sent successfully. Hash:", txResponse.hash);
  demonstrateTxResponse(txResponse);

  console.log("Waiting the transaction minting...");
  let txReceipt: TransactionReceipt;
  try {
    txReceipt = await txResponse.wait(1);
  } catch (e: any) {
    console.log(`❌ Transaction minting failed.`);
    demonstrateTxMintingErr(e, txResponse);
    process.exit(1);
  }
  console.log("✅ The transaction has been minted successfully. Hash:", txReceipt.transactionHash);
  demonstrateTxReceipt(txReceipt);
}

main();