require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/bL2HlQz1ylSspVGEwkAlq-nYDBdQmnI8",
      accounts: ["0x5cdcd7e0b2f391b64a2da79a35aa4071e3cccb590a680e6a08f7718b9cb35c2c"],
      // gas: 2100000,
      // gasPrice: 8000000000
    },
    // rinkeby: {
    //   url: "https://eth-rinkeby.alchemyapi.io/v2/bMWIXQAHvUbuu3W7MRvqFd5u0wlZZW-s",
    //   accounts: ["0x5cdcd7e0b2f391b64a2da79a35aa4071e3cccb590a680e6a08f7718b9cb35c2c"],
    // },
  },
  etherscan: {
    apiKey: "4EB6NXPZFGQIKP2DKNTGMWD2J793IHEXIF"
  }
};