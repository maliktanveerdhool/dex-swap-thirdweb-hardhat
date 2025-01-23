const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX Contract", function () {
  let dex;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the ERC20 token first
    const ERC20Base = await ethers.getContractFactory("ERC20Base");
    token = await ERC20Base.deploy(owner.address, "Test Token", "TST");
    await token.deployTransaction.wait();

    // Deploy the DEX contract
    const DEX = await ethers.getContractFactory("DEX");
    dex = await DEX.deploy(await token.getAddress(), owner.address, "DEX LP Token", "DLP");
    await dex.deployTransaction.wait();

    // Mint some tokens for testing
    const mintAmount = ethers.parseEther("1000");
    await token.mint(addr1.address, mintAmount);
    await token.mint(addr2.address, mintAmount);
  });

  describe("Deployment", function () {
    it("Should set the right token address", async function () {
      expect(await dex.token()).to.equal(await token.getAddress());
    });
  });

  describe("Liquidity", function () {
    it("Should allow adding liquidity", async function () {
      const tokenAmount = ethers.parseEther("100");
      const ethAmount = ethers.parseEther("1");

      // Approve tokens
      await token.connect(addr1).approve(await dex.getAddress(), tokenAmount);

      // Add liquidity
      await dex.connect(addr1).addLiquidity(tokenAmount, {
        value: ethAmount
      });

      // Check balances
      expect(await dex.balanceOf(addr1.address)).to.be.gt(0);
      expect(await dex.getTokensInContract()).to.equal(tokenAmount);
    });
  });

  describe("Swapping", function () {
    beforeEach(async function () {
      // Add initial liquidity
      const tokenAmount = ethers.parseEther("100");
      const ethAmount = ethers.parseEther("1");
      
      await token.connect(addr1).approve(await dex.getAddress(), tokenAmount);
      await dex.connect(addr1).addLiquidity(tokenAmount, {
        value: ethAmount
      });
    });

    it("Should allow ETH to Token swap", async function () {
      const swapAmount = ethers.parseEther("0.1");
      const initialTokenBalance = await token.balanceOf(addr2.address);

      await dex.connect(addr2).swapEthToToken({
        value: swapAmount
      });

      expect(await token.balanceOf(addr2.address)).to.be.gt(initialTokenBalance);
    });
  });
});
