import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";

// Script input parameters
const contractName: string = process.env.SP_CONTRACT_NAME || "ContractA";

async function main() {
  console.log(`Deploying the contract '${contractName}' ...`);
  const contractFactory: ContractFactory = await ethers.getContractFactory(contractName);
  const contract: Contract = await contractFactory.deploy();
  await contract.deployed();
  console.log("✅ Token contract has been deployed successfully at:", contract.address);
}

main();