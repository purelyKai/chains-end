import { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import GameInterface from "./components/GameInterface";
import "./App.css";

const App = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <div className="App">
      <h1>Chain's End</h1>
      <ConnectWallet onWalletConnect={setWalletAddress} />
      {walletAddress && <GameInterface walletAddress={walletAddress} />}
    </div>
  );
};

export default App;
