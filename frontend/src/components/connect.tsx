import { useState } from "react";
import { formatEther } from "ethers/utils";

// Define the types for the state
interface WalletData {
  address: string;
  balance: string | null;
}

interface ConnectWalletProps {
  onWalletConnect: (address: string) => void;
}

const ConnectWallet = ({ onWalletConnect }: ConnectWalletProps) => {
  // useState for storing and retrieving wallet details
  const [data, setData] = useState<WalletData>({
    address: "",
    balance: null,
  });

  // Button handler for handling a request event for MetaMask
  const btnHandler = () => {
    if (window.ethereum) {
      // Requesting accounts from MetaMask
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res: string[]) => accountChangeHandler(res[0]));
    } else {
      alert("Install MetaMask extension!");
    }
  };

  // Get balance function for fetching balance with ethers.js
  const getBalance = (address: string) => {
    window.ethereum
      .request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      .then((balance: string) => {
        setData({
          address,
          balance: formatEther(balance),
        });
      });
  };

  // Handle account changes
  const accountChangeHandler = (account: string) => {
    setData({
      address: account,
      balance: null, // Reset balance while waiting for it to load
    });

    onWalletConnect(account); // Pass wallet address to parent component
    getBalance(account);
  };

  return (
    <div className="connect-wallet-container">
      <div className="wallet-card">
        <div className="wallet-header">
          <strong>Address: </strong>
          {data.address || "Not connected"}
        </div>
        <div className="wallet-body">
          <p>
            <strong>Balance: </strong>
            {data.balance !== null ? data.balance : "Loading..."}
          </p>
          <button onClick={btnHandler} className="connect-btn">
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConnectWallet;
