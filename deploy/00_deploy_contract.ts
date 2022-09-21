import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  let { deployer, beneficiary, royalties } = await getNamedAccounts();

  await deploy('Cryptsters', {
    from: deployer,
    args: [beneficiary, royalties, "https://cryptstersapi.ubiqsmart.com/cryptster/"],
    log: true,
  });
};

export default func;
func.tags = ['Crypsters'];
