const { expect } = require("chai");
const { ethers } = require("hardhat");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/dist/src/signer-with-address");

describe("Project", () => {
  let account1 =  SignerWithAddress;
  let account2 =  SignerWithAddress;

  beforeEach(async () => {
    const [address1, address2] = await ethers.getSigners();
    account1 = address1;
    account2 = address2;
  });

  const deployProject = async () => {
    const acroToken = await ethers.getContractFactory("AcroToken", account1);
    const contract = await acroToken.deploy();
    await contract.deployed();
    return contract;
  };

  describe("acroToken", () => {
    let project;
    beforeEach(async () => {
      project = await deployProject();
    });
    it("constructor creator address value", async () => {
      const creator = await project.name();
      expect(creator).to.equal("AcroToken");
    });
    it("constructor creator address value", async () => {
      const creator = await project.symbol();
      expect(creator).to.equal("ACR");
    });
    it("constructor creator address value", async () => {
      const creator = await project.decimals();
      expect(creator).to.equal(18);
    });
    it("constructor creator address value", async () => {
      const creator = await project.totalSupply();
      expect(creator).to.equal("500000");
    });
    it("constructor creator address value", async () => {
      const creator = await project.balanceOf(account1.address);
      expect(creator).to.equal("500000");
    });
  });
});
