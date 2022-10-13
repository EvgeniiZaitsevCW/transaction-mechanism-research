import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { proveTx } from "../test-utils/eth";


describe("Contract 'ContractA'", async () => {
  let contract: Contract;
  let deployer: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contract under test
    const contractFactory: ContractFactory = await ethers.getContractFactory("ContractA");
    contract = await contractFactory.deploy();
    await contract.deployed();

    // Get user accounts
    [deployer] = await ethers.getSigners();
  });

  it("Is deployed successfully", async () => {
    expect(await contract.isDeployed()).to.equal(true);
    expect(await contract.x()).to.equal(0);
  });

  it("Function 'setX()' executes as expected", async () => {
    const x = 123;
    await proveTx(contract.setX(x));
    expect(await contract.x()).to.equal(x);
  });

  it("Function 'setX()' emits the expected event", async () => {
    const x = 123;
    await expect(
      contract.setX(x)
    ).to.be.emit(
      contract,
      "SetX"
    ).withArgs(
      deployer.address,
      0,
      x
    );
  });

  it("Function 'setDifferentX()' executes successfully if the new value is different", async () => {
    const x = 123;
    await expect(
      contract.setDifferentX(x)
    ).to.be.emit(
      contract,
      "SetX"
    ).withArgs(
      deployer.address,
      0,
      x
    );
  });

  it("Function 'setDifferentX()' is reverted if the new value is the same", async () => {
    await expect(
      contract.setDifferentX(0)
    ).to.be.revertedWith("The provided value is the same as the stored one");
  });
});
