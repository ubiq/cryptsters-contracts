import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import 'hardhat-deploy';
import 'hardhat-abi-exporter';

import { HardhatUserConfig } from 'hardhat/config';

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
          evmVersion: "istanbul",
        },
      },
    ],
  },
  networks: {
    hardhat: {
      accounts: {mnemonic: 'test test test test test test test test test test test junk',
                 accountsBalance: "100000000000000000000000"},
    },
    localhost: {
      accounts: {mnemonic: 'test test test test test test test test test test test junk',
                 accountsBalance: "100000000000000000000000"},
    },
    mainnet: {
      url: "http://127.0.0.1:8588",
      chainId: 8,
      gasPrice: 81000000000,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      "mainnet": '0xc5070A5CB93F4497240a57969485C0FbF5c2ee3A',
    },
    beneficiary: {
      default: 0,
    },
    royalties: {
      default: 0,
    }
  },
  abiExporter: {
    path: './data/abi',
    runOnCompile: true,
    flat: true,
  }
};

export default config;
