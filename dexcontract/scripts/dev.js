const { exec } = require('child_process');
const fs = require('fs');

async function runCommand(command) {
    return new Promise((resolve, reject) => {
        const process = exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            resolve(stdout);
        });

        process.stdout.on('data', (data) => {
            console.log(data.toString());
        });
    });
}

async function main() {
    try {
        // Clean artifacts and cache
        console.log("Cleaning previous build artifacts...");
        if (fs.existsSync("./artifacts-zk")) {
            fs.rmSync("./artifacts-zk", { recursive: true });
        }
        if (fs.existsSync("./cache-zk")) {
            fs.rmSync("./cache-zk", { recursive: true });
        }

        // Compile contracts
        console.log("\nCompiling contracts...");
        await runCommand("npx hardhat compile");

        // Run tests
        console.log("\nRunning tests...");
        await runCommand("npx hardhat --network ganache test");

        // Deploy contracts
        console.log("\nDeploying contracts to Ganache...");
        await runCommand("npx hardhat --network ganache run scripts/deploy.js");

        console.log("\nDevelopment setup completed successfully!");
        console.log("You can now:");
        console.log("1. Import the token and DEX addresses from deployment.json to your frontend");
        console.log("2. Use the deployer account from deployment.json to interact with contracts");
        console.log("3. Connect MetaMask to Ganache (http://127.0.0.1:8545)");
        
    } catch (error) {
        console.error("Development setup failed:", error);
        process.exit(1);
    }
}

main();
