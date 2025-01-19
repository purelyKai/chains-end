import { useState } from "react";
import ConnectWallet from "./components/connect";
import GameInterface from "./components/interface";
import { Game } from "./components/game";

const App = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  if (!walletAddress) {
    return (
      <div>
        <h1>Chain's End</h1>
        <ConnectWallet onWalletConnect={setWalletAddress} />
        {walletAddress && <GameInterface walletAddress={walletAddress} />}
      </div>
    );
  }

  return (
    <div className="bg-black w-screen h-screen flex items-center justify-center">
      <div className="w-full h-1/2">
        <Game />
      </div>
    </div>
  )
};

export default App;
