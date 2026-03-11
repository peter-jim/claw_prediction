import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('PredictionMarket', function () {
  async function deployFixture() {
    const [owner, buyer1, buyer2] = await ethers.getSigners();
    const MockUSDC = await ethers.getContractFactory('MockUSDC');
    const usdc = await MockUSDC.deploy();
    const endTime = (await time.latest()) + 30 * 24 * 60 * 60;
    const PredictionMarket = await ethers.getContractFactory('PredictionMarket');
    const market = await PredictionMarket.deploy(
      await usdc.getAddress(), 'Test Question?', 'Crypto', endTime, owner.address
    );
    return { market, usdc, owner, buyer1, buyer2, endTime };
  }

  it('should deploy with correct initial state', async function () {
    const { market } = await deployFixture();
    const info = await market.getMarketInfo();
    expect(info[0]).to.equal('Test Question?');
    expect(info[3]).to.equal(false);
  });

  it('should allow buying YES shares', async function () {
    const { market, usdc, buyer1 } = await deployFixture();
    const amount = ethers.parseUnits('100', 18);
    await usdc.faucet(buyer1.address, ethers.parseUnits('1000', 6));
    await usdc.connect(buyer1).approve(await market.getAddress(), ethers.parseUnits('1000', 6));
    await market.connect(buyer1).buyShares(true, amount, ethers.parseUnits('1000', 6));
    expect(await market.yesShares(buyer1.address)).to.equal(amount);
  });

  it('should resolve and allow claiming winnings', async function () {
    const { market, usdc, owner, buyer1, endTime } = await deployFixture();
    const amount = ethers.parseUnits('100', 18);
    await usdc.faucet(buyer1.address, ethers.parseUnits('1000', 6));
    await usdc.connect(buyer1).approve(await market.getAddress(), ethers.parseUnits('1000', 6));
    await market.connect(buyer1).buyShares(true, amount, ethers.parseUnits('1000', 6));
    
    await time.increaseTo(endTime + 1);
    await market.connect(owner).resolve(true);
    
    const balanceBefore = await usdc.balanceOf(buyer1.address);
    await market.connect(buyer1).claimWinnings();
    const balanceAfter = await usdc.balanceOf(buyer1.address);
    expect(balanceAfter).to.be.gt(balanceBefore);
  });
});
