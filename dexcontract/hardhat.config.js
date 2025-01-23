require("@matterlabs/hardhat-zksync-solc");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: [
        // Add your Ganache private key here (the first account from your Ganache UI)
        "0xd82f696e15b26e3c3b6607c142c2d33ee8e39e39399c654d446c95075f90fa8f"  // This is a default Ganache private key, replace with yours
      ]
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/your-api-key",
      accounts: [process.env.PRIVATE_KEY || ""],
      chainId: 11155111,
    }
  },
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    cache: "./cache",
    tests: "./test"
  }
};
