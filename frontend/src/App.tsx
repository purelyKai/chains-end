import { useState } from "react";
import ConnectWallet from "./components/connect";
import GameInterface from "./components/interface";
import { Game } from "./components/game";

const App = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [hasStartedGame, setHasStartedGame] = useState(false);

  if (!walletAddress) {
    return (
      <div>
        <h1>Chain's End</h1>
        <ConnectWallet onWalletConnect={setWalletAddress} />
      </div>
    );
  }

  if (!hasStartedGame) {
    return (
      <div>
        <h1>Welcome to Chain's End</h1>
        <GameInterface walletAddress={walletAddress} />
        <button
          onClick={() => setHasStartedGame(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black w-screen h-screen flex items-center justify-center">
      <div className="w-full h-1/2">
        <Game />
      </div>
    </div>
  );
};

export default App;
