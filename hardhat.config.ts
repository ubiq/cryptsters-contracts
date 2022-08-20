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

function getMnemonic(networkName?: string): string {
  if (networkName) {
    const mnemonic = process.env['MNEMONIC_' + networkName.toUpperCase()];
    if (mnemonic && mnemonic !== '') {
      return mnemonic;
    }
  }

  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic || mnemonic === '') {
    return 'test test test test test test test test test test test junk';
  }
  return mnemonic;
}

function accounts(networkName?: string): {mnemonic: string} {
  return {mnemonic: getMnemonic(networkName)};
}

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
    localhost: {
      accounts: accounts(),
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
