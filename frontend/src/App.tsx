import { useState, useEffect } from "react";
import ConnectWallet from "./components/connect";
import { Game } from "./components/game";
import { getGameState, createPlayer } from "./contracts/gameState";

const App = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [gameState, setGameState] = useState<any>(undefined)

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const gameState = await getGameState();
        setGameState(gameState);
      } catch (error) {
        console.error('Failed to fetch game state', error);
      }
    };
  
    fetchGameState();
  }, [])

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
        <p>There are {gameState.totalPlayers} players</p>
        <button
          onClick={async() => {
            setHasStartedGame(true)
            await createPlayer()
          }}
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
        <Game playerAddr={walletAddress}/>
      </div>
    </div>
  );
};

export default App;
