import type { AppProps } from "next/app";
import { ThirdwebProvider, metamaskWallet } from "@thirdweb-dev/react";
import "../styles/globals.css";
import Navbar from "../components/Navbar";

// Define local Ganache network
const activeChain = {
  chainId: 1337,
  rpc: ["http://127.0.0.1:7545"],
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  shortName: "ganache",
  slug: "ganache",
  testnet: true,
  chain: "Ganache",
  name: "Ganache Local",
};

// Your client ID from thirdweb dashboard
const clientId = "09a278344d7b539ca16109b1f780deb8";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      clientId={clientId}
      activeChain={activeChain}
      supportedWallets={[metamaskWallet()]}
      sdkOptions={{
        readonlySettings: {
          rpcUrl: "http://127.0.0.1:7545",
          chainId: 1337,
        }
      }}
    >
      <Navbar/>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
