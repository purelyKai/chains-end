import { useState } from "react";
import { formatEther } from "ethers/utils";

interface ConnectWalletProps {
  onWalletConnect: (address: string, balance: string) => void;
}

const ConnectWallet = ({ onWalletConnect }: ConnectWalletProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        const balanceWei = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        const balanceEth = formatEther(balanceWei);
        onWalletConnect(address, balanceEth);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    } else {
      alert("Please install MetaMask to access the Crypto Dungeon!");
    }
    setIsConnecting(false);
  };

  return (
    <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl p-6 w-full max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold text-yellow-500 mb-4">
        Connect Your Crypto Wallet
      </h2>
      <p className="text-gray-300 mb-6">
        To embark on your journey through the Blockchain Dungeon, you must first
        connect your magical wallet.
      </p>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full py-3 px-4 bg-yellow-600 text-white rounded-lg font-semibold transition-all hover:bg-yellow-700 hover:scale-105 shadow-lg disabled:opacity-50"
      >
        {isConnecting ? "Summoning Portal..." : "Summon MetaMask Portal"}
      </button>
    </div>
  );
};

export default ConnectWallet;
