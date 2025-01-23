const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  try {
    // Deploy the token first
    const Token = await hre.ethers.getContractFactory("contracts/ERC20Base.sol:ERC20Base");
    const token = await Token.deploy(
      deployer.address,  // default admin address
      "Test Token",      // token name
      "TST"             // token symbol
    );
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("Token deployed to:", tokenAddress);
    console.log("1,000,000 tokens automatically minted to:", deployer.address);

    // Deploy the DEX contract
    const DEX = await hre.ethers.getContractFactory("contracts/DEX.sol:DEX");
    const dex = await DEX.deploy(
      tokenAddress,     // token address we just deployed
      deployer.address, // default admin address
      "DEX LP Token",   // LP token name
      "DLP"            // LP token symbol
    );
    await dex.waitForDeployment();
    const dexAddress = await dex.getAddress();
    console.log("DEX deployed to:", dexAddress);

    // Save deployment addresses to a file for frontend
    const fs = require("fs");
    const deploymentInfo = {
      tokenAddress,
      dexAddress,
      deployerAddress: deployer.address,
      chainId: hre.network.config.chainId
    };

    // Save to both contract directory and frontend directory
    fs.writeFileSync(
      "deployment.json",
      JSON.stringify(deploymentInfo, null, 2)
    );

    // Also save to frontend if it exists
    const frontendPath = "../dexswapapp/src/deployment.json";
    if (fs.existsSync("../dexswapapp")) {
      fs.writeFileSync(
        frontendPath,
        JSON.stringify(deploymentInfo, null, 2)
      );
      console.log("\nDeployment info saved to frontend at:", frontendPath);
    }

    console.log("\nDeployment Complete! Contract addresses:");
    console.log("Token:", tokenAddress);
    console.log("DEX:", dexAddress);
    console.log("Deployer:", deployer.address);

    // Print some helpful next steps
    console.log("\nNext steps:");
    console.log("1. Add these token details to MetaMask:");
    console.log(`   - Token Address: ${tokenAddress}`);
    console.log("   - Token Symbol: TST");
    console.log("   - Decimals: 18");
    console.log("\n2. Add the DEX address to your frontend configuration:");
    console.log(`   - DEX Address: ${dexAddress}`);
    console.log("\n3. To interact with the DEX:");
    console.log("   a. First approve the DEX contract to spend your tokens:");
    console.log(`      - Call approve(${dexAddress}, amount) on the token contract`);
    console.log("   b. Then you can:");
    console.log("      - Add liquidity using addLiquidity()");
    console.log("      - Swap ETH for tokens using swapEthToToken()");
    console.log("      - Swap tokens for ETH using swapTokenToEth()");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
