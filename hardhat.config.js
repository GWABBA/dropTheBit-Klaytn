require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");
require("hardhat-gas-reporter");
const fs = require("fs");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.6"
      },
      {
        version: "0.4.24"
      },
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.13"
      },
      {
        version: "0.8.0"
      }
    ]
  },
  gasReporter: {
    enabled: false,
    currency: "USD"
  },
  networks: {
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20e9,
      gas: 25e6
      // accounts: [privateKey]
    },
    mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20e9,
      gas: 25e6
      // accounts: [privateKey]
    },
    localhost: {
      url: "http://127.0.0.1:7545"
      // gasPrice: 20e9,
      // gas: 25e6,
    },
    mumbai: {
      //url: "https://rpc-mumbai.maticvigil.com",
      url: "https://polygon-mumbai.infura.io/v3/7618ab0b33ec40548070f4b40444e04f",
      chainId: 80001,
      gasPrice: 20e9,
      gas: 25e6,
      //accounts: [privateKey],
      accounts: [
        "79f565d2570444f3562ce6f764617939857ce020d2a0db11997da41e82ab5e16"
      ]
    },
    polygon: {
      url: "https://polygon-rpc.com",
      chainId: 137,
      //accounts: [privateKey],
      accounts: [
        "79f565d2570444f3562ce6f764617939857ce020d2a0db11997da41e82ab5e16"
      ]
    },
    evmos: {
      url: "https://eth.bd.evmos.org:8545",
      chainId: 9001,
      accounts: [
        "79f565d2570444f3562ce6f764617939857ce020d2a0db11997da41e82ab5e16"
      ]
    },
    evmos_testnet: {
      url: "https://eth.bd.evmos.dev:8545",
      chainId: 9000,
      accounts: [
        "79f565d2570444f3562ce6f764617939857ce020d2a0db11997da41e82ab5e16"
      ]
    },
    klaytn_baobab: {
      url: "https://api.baobab.klaytn.net:8651/",
      chainId: 1001,
      gasPrice: 250000000000,
      accounts: [
        "0x9c0cc2af49eeb1ddaaaaf632938c55d9f5e1021b495361da9ce6787b7e13608d"
      ]
    }
  },
  mocha: {
    timeout: 100000000000000
  }
};
