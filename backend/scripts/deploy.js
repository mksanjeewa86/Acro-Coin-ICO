const hre = require("hardhat");
const { ethers } = require("hardhat");

const main = async () => {
  const [deployer] = await ethers.getSigners();
  const transactionsFactory = await hre.ethers.getContractFactory("AcroICO");
  const transactionsContract = await transactionsFactory.deploy(true);
  await transactionsContract.deployed();
  console.log("AcroICO address: ", transactionsContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();