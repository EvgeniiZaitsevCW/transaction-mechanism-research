import { ethers } from "hardhat";

// Script input parameters
const transactionHash: string = process.env.SP_TRANSACTION_HASH
  || "0xb82614e6ed8ad9506136f59168865eeae779936b1aabbf045d64a6ed171cb7e5";

async function main() {
  const txResponse = await ethers.provider.getTransaction(transactionHash);
  console.log("txResponse:", txResponse);
}

main();