const hre = require("hardhat");

const ADMIN_ADDRESS = "0x920eF520F29535be655176DB06cAa60c43FC7b50";

async function main() {
  // Deploy the token first
  const Token = await hre.ethers.getContractFactory("contracts/ERC20Base.sol:ERC20Base");
  const token = await Token.deploy(
    ADMIN_ADDRESS, // default admin address
    "Test Token",  // token name
    "TST"         // token symbol
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("Token deployed to:", tokenAddress);

  // Deploy the DEX contract
  const DEX = await hre.ethers.getContractFactory("contracts/DEX.sol:DEX");
  const dex = await DEX.deploy(
    tokenAddress,  // token address we just deployed
    ADMIN_ADDRESS, // default admin address
    "DEX LP Token", // LP token name
    "DLP"          // LP token symbol
  );
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  console.log("DEX deployed to:", dexAddress);

  // For verification purposes
  console.log("\nDeployment details:");
  console.log("Token address:", tokenAddress);
  console.log("DEX address:", dexAddress);
  console.log("\nVerify Token contract:");
  console.log(`npx hardhat verify --network sepolia ${tokenAddress} "${ADMIN_ADDRESS}" "Test Token" "TST"`);
  console.log("\nVerify DEX contract:");
  console.log(`npx hardhat verify --network sepolia ${dexAddress} "${tokenAddress}" "${ADMIN_ADDRESS}" "DEX LP Token" "DLP"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
