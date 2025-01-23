import { ConnectWallet, useAddress, useBalance, useContract, useContractRead, Web3Button } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import SwapInput from "../components/SwapInput";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers } from "ethers";

// Contract ABIs
const DEX_ABI = [
  {
    "inputs": [],
    "name": "swapEthToToken",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_tokenSold", "type": "uint256"}],
    "name": "swapTokenToEth",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTokensInContract",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_tokenAmount", "type": "uint256"}],
    "name": "addLiquidity",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  }
];

const TOKEN_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract addresses configuration
const CONTRACT_ADDRESSES = {
  TOKEN_CONTRACT: "0xa42ebea44dC84c89bAc5d9BD55FA2c2728037C80",
  DEX_CONTRACT: "0x90A91AE2fde7d250346a7C65Ddb440F76807eADD"
};

const Home: NextPage = () => {
  // Contract addresses from configuration
  const TOKEN_CONTRACT = CONTRACT_ADDRESSES.TOKEN_CONTRACT;
  const DEX_CONTRACT = CONTRACT_ADDRESSES.DEX_CONTRACT;

  const address = useAddress();
  
  const { contract: tokenContract } = useContract(TOKEN_CONTRACT, TOKEN_ABI);
  const { contract: dexContract } = useContract(DEX_CONTRACT, DEX_ABI);

  const { data: symbol } = useContractRead(tokenContract, "symbol");
  const { data: tokenBalance } = useContractRead(tokenContract, "balanceOf", [address]);
  const { data: dexTokenBalance } = useContractRead(dexContract, "getTokensInContract");
  const { data: nativeBalance } = useBalance();

  const [contractBalance, setContractBalance] = useState<string>("0");
  const [nativeValue, setNativeValue] = useState<string>("0");
  const [tokenValue, setTokenValue] = useState<string>("0");
  const [currentForm, setCurrentForm] = useState<string>("native");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [estimatedOutput, setEstimatedOutput] = useState<string>("0");

  // Calculate conversion rate and update the other input
  const updateInputValues = async (amount: string, isEthInput: boolean) => {
    try {
      if (!dexContract || !amount || parseFloat(amount) === 0) {
        if (isEthInput) {
          setTokenValue("0");
        } else {
          setNativeValue("0");
        }
        setEstimatedOutput("0");
        return;
      }

      const inputAmountWei = parseEther(amount);
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
      const dexEthBalance = await provider.getBalance(DEX_CONTRACT);
      const dexTokens = dexTokenBalance ? dexTokenBalance.toString() : "0";

      if (isEthInput) {
        // ETH to Token calculation
        const numerator = inputAmountWei.mul(dexTokens);
        const denominator = dexEthBalance.mul(100).add(inputAmountWei);
        const estimatedTokens = numerator.div(denominator);
        const formattedTokens = formatEther(estimatedTokens);
        setTokenValue(formattedTokens);
        setEstimatedOutput(formattedTokens);
      } else {
        // Token to ETH calculation
        const numerator = inputAmountWei.mul(dexEthBalance);
        const denominator = ethers.BigNumber.from(dexTokens).mul(100).add(inputAmountWei);
        const estimatedEth = numerator.div(denominator);
        const formattedEth = formatEther(estimatedEth);
        setNativeValue(formattedEth);
        setEstimatedOutput(formattedEth);
      }
    } catch (error) {
      console.error("Error calculating conversion:", error);
      if (isEthInput) {
        setTokenValue("0");
      } else {
        setNativeValue("0");
      }
      setEstimatedOutput("0");
    }
  };

  // Handle input changes
  const handleNativeValueChange = (value: string) => {
    setNativeValue(value);
    updateInputValues(value, true);
  };

  const handleTokenValueChange = (value: string) => {
    setTokenValue(value);
    updateInputValues(value, false);
  };

  // Update estimates when contract data changes
  useEffect(() => {
    if (currentForm === "native") {
      updateInputValues(nativeValue, true);
    } else {
      updateInputValues(tokenValue, false);
    }
  }, [dexTokenBalance, currentForm]);

  const executeSwap = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!dexContract || !tokenContract) {
      alert("Contracts not initialized properly. Please refresh the page.");
      return;
    }

    try {
      setIsLoading(true);
      
      if (currentForm === "native") {
        const ethAmount = parseEther(nativeValue || "0");
        if (ethAmount.lte(0)) {
          alert("Please enter a valid amount");
          return;
        }

        // Check if DEX has enough tokens
        const dexTokens = dexTokenBalance ? dexTokenBalance.toString() : "0";
        if (ethers.BigNumber.from(dexTokens).lte(0)) {
          alert("Insufficient liquidity in the DEX. Please add liquidity first.");
          return;
        }

        await dexContract.call("swapEthToToken", [], {
          value: ethAmount,
          gasLimit: 500000
        });
        alert("Swap executed successfully!");
      } else {
        const tokenAmount = parseEther(tokenValue || "0");
        if (tokenAmount.lte(0)) {
          alert("Please enter a valid amount");
          return;
        }

        // Check if DEX has enough ETH
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
        const dexEthBalance = await provider.getBalance(DEX_CONTRACT);
        if (dexEthBalance.lte(0)) {
          alert("Insufficient ETH liquidity in the DEX. Please add liquidity first.");
          return;
        }

        console.log("Starting token to ETH swap...");
        console.log("Token amount:", formatEther(tokenAmount));

        // First approve tokens
        console.log("Approving tokens...");
        const approveTx = await tokenContract.call(
          "approve",
          [DEX_CONTRACT, tokenAmount],
          { gasLimit: 100000 }
        );
        console.log("Approval transaction:", approveTx);

        // Then swap
        console.log("Executing swap...");
        await dexContract.call(
          "swapTokenToEth",
          [tokenAmount],
          { gasLimit: 500000 }
        );
        
        alert("Swap executed successfully!");
      }
    } catch (error) {
      console.error("Swap error:", error);
      if (error.message?.includes("insufficient funds")) {
        alert("Insufficient funds for swap. Make sure you have enough tokens and ETH for gas fees.");
      } else if (error.message?.includes("user rejected")) {
        alert("Transaction was rejected. Please try again.");
      } else if (error.message?.includes("Internal JSON-RPC error")) {
        alert("Transaction failed. This could be due to:\n1. Insufficient liquidity in the DEX\n2. Price impact too high\n3. Network connection issues\n\nTry with a smaller amount.");
      } else {
        alert(`Failed to execute swap: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
      fetchContractBalance();
    }
  };

  const addInitialLiquidity = async () => {
    if (!address || !tokenContract || !dexContract) {
      alert("Please connect your wallet and make sure contracts are initialized");
      return;
    }

    try {
      setIsLoading(true);
      const ethAmount = parseEther("1"); // Add 1 ETH liquidity
      const tokenAmount = parseEther("100"); // Add 100 tokens liquidity

      // Check token balance
      const tokenBalance = await tokenContract.call("balanceOf", [address]);
      if (tokenBalance.lt(tokenAmount)) {
        alert("Insufficient token balance. You need at least 100 TST tokens.");
        return;
      }

      // Check if already approved
      const allowance = await tokenContract.call("allowance", [address, DEX_CONTRACT]);
      if (allowance.lt(tokenAmount)) {
        // First approve tokens
        console.log("Approving tokens...");
        const approveTx = await tokenContract.call(
          "approve",
          [DEX_CONTRACT, tokenAmount],
          { 
            gasLimit: 200000 
          }
        );
        await approveTx.wait(); // Wait for approval to be mined
      }

      // Then add liquidity
      console.log("Adding liquidity...");
      const addLiquidityTx = await dexContract.call(
        "addLiquidity",
        [tokenAmount],
        {
          value: ethAmount,
          gasLimit: 500000
        }
      );
      await addLiquidityTx.wait(); // Wait for transaction to be mined

      alert("Liquidity added successfully!");
      await fetchContractBalance();
    } catch (error: any) {
      console.error("Error adding liquidity:", error);
      if (error.reason) {
        alert(`Failed to add liquidity: ${error.reason}`);
      } else {
        alert("Failed to add liquidity. Please check your token balance and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContractBalance = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
      const balance = await provider.getBalance(DEX_CONTRACT);
      setContractBalance(formatEther(balance));
    } catch (error) {
      console.error("Error fetching contract balance:", error);
    }
  };

  useEffect(() => {
    if (address) {
      fetchContractBalance();
      const interval = setInterval(fetchContractBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [address]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div
          style={{
            backgroundColor: "#111",
            padding: "2rem",
            borderRadius: "10px",
            minWidth: "500px",
          }}
        >
          <div style={{ marginBottom: "1rem", textAlign: "center" }}>
            <p>DEX Contract Balance: {contractBalance} ETH</p>
            <p>DEX Token Balance: {dexTokenBalance ? formatEther(dexTokenBalance.toString()) : "0"} TST</p>
            <div style={{ margin: "10px 0", padding: "10px", border: "1px solid #333", borderRadius: "5px" }}>
              <h3 style={{ margin: "0 0 10px 0" }}>Your Wallet</h3>
              <p style={{ margin: "5px 0" }}>
                ETH Balance: {nativeBalance ? nativeBalance.displayValue : "0"} ETH
              </p>
              <p style={{ margin: "5px 0" }}>
                TST Balance: {tokenBalance ? formatEther(tokenBalance) : "0"} TST
              </p>
              <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
                Wallet Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"}
              </p>
            </div>
            <Web3Button
              contractAddress={DEX_CONTRACT}
              action={addInitialLiquidity}
              className={styles.button}
            >
              Add Initial Liquidity
            </Web3Button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: currentForm === "native" ? "column" : "column-reverse",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px",
            }}
          >
            <SwapInput
              current={currentForm}
              type="native"
              max={nativeBalance?.displayValue}
              value={nativeValue}
              setValue={handleNativeValueChange}
              tokenSymbol="ETH"
              tokenBalance={nativeBalance?.displayValue}
            />
            <div style={{ margin: "10px 0", textAlign: "center" }}>
              <button
                onClick={() => {
                  currentForm === "native"
                    ? setCurrentForm("token")
                    : setCurrentForm("native");
                  setNativeValue("0");
                  setTokenValue("0");
                  setEstimatedOutput("0");
                }}
              >
                ↓
              </button>
              <p style={{ margin: "5px 0", fontSize: "0.9em", color: "#666" }}>
                Rate: 1 {currentForm === "native" ? "ETH" : "TST"} ≈ {
                  parseFloat(estimatedOutput) > 0 && (currentForm === "native" ? nativeValue : tokenValue)
                    ? (parseFloat(estimatedOutput) / parseFloat(currentForm === "native" ? nativeValue : tokenValue)).toFixed(4)
                    : "0"
                } {currentForm === "native" ? "TST" : "ETH"}
              </p>
            </div>
            <SwapInput
              current={currentForm}
              type="token"
              max={tokenBalance ? formatEther(tokenBalance) : "0"}
              value={tokenValue}
              setValue={handleTokenValueChange}
              tokenSymbol={symbol as string}
              tokenBalance={tokenBalance ? formatEther(tokenBalance) : "0"}
            />
          </div>
          {address ? (
            <div style={{ textAlign: "center" }}>
              <Web3Button
                contractAddress={DEX_CONTRACT}
                action={executeSwap}
                isDisabled={isLoading}
                className={styles.button}
              >
                {isLoading ? "Loading..." : "Swap"}
              </Web3Button>
            </div>
          ) : (
            <p>Connect a wallet to exchange</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
