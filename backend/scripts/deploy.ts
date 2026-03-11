import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with:', deployer.address);

  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log('MockUSDC deployed to:', usdcAddress);

  const MarketFactory = await ethers.getContractFactory('MarketFactory');
  const factory = await MarketFactory.deploy(usdcAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log('MarketFactory deployed to:', factoryAddress);

  const endTime = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
  const tx = await factory.createMarket(
    'Will Bitcoin reach $100k by end of March?',
    'Crypto',
    endTime
  );
  const receipt = await tx.wait();
  console.log('Sample market created, tx:', receipt?.hash);

  console.log('\nDeployment summary:');
  console.log('USDC_ADDRESS=', usdcAddress);
  console.log('FACTORY_ADDRESS=', factoryAddress);
}

main().catch(console.error);
