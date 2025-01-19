import { useState, useEffect } from "react";
import ConnectWallet from "./components/connect";
import { Game } from "./components/game";
import { getGameState, createPlayer } from "./contracts/gameState";
import Store from "./components/store";

const App = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [gameState, setGameState] = useState<any>(undefined);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const gameState = await getGameState();
        setGameState(gameState);
      } catch (error) {
        console.error("Failed to fetch game state", error);
      }
    };

    fetchGameState();
  }, []);

  const updateWalletInfo = (address: string, balance: string) => {
    setWalletAddress(address);
    setWalletBalance(balance);
  };

  if (hasStartedGame) {
    return (
      <div className="bg-black w-screen h-screen flex items-center justify-center">
        <div className="w-full h-1/2">
          <Game />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-screen h-screen flex flex-col items-center justify-between bg-cover bg-center font-[VP-Pixel]"
      style={{ backgroundImage: "url('/splash.png')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70" />

      {/* Header */}
      <div className="z-10 text-center px-4 w-full pt-8">
        <h1 className="text-6xl font-bold text-yellow-500 mb-4 tracking-wider">
          Chain's End
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Descend into the Cryptic Depths of the Blockchain Dungeon
        </p>
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center justify-center flex-grow w-full px-4">
        {!walletAddress ? (
          <ConnectWallet onWalletConnect={updateWalletInfo} />
        ) : (
          <div className="space-y-6 text-center">
            <p className="text-2xl text-green-400">
              {gameState?.totalPlayers || "Loading..."} Brave Souls Have Entered
              the Dungeon
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={async () => {
                  setHasStartedGame(true);
                  await createPlayer();
                }}
                className="px-8 py-4 bg-yellow-600 text-white rounded-lg text-xl font-semibold transition-all hover:bg-yellow-700 hover:scale-105 shadow-lg"
              >
                Enter the Dungeon
              </button>
              <button
                onClick={() => setIsStoreOpen(true)}
                className="px-8 py-4 bg-purple-600 text-white rounded-lg text-xl font-semibold transition-all hover:bg-purple-700 hover:scale-105 shadow-lg"
              >
                Crypto Armory
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Wallet Info */}
      <div className="z-10 w-full p-4 bg-gray-800 bg-opacity-80">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <p className="text-yellow-300 font-mono text-sm truncate">
            Address: {walletAddress || "Not Connected"}
          </p>
          <p className="text-yellow-300 font-mono text-sm">
            Balance: {walletBalance ? `${walletBalance} FRAG` : "N/A"}
          </p>
        </div>
      </div>

      {isStoreOpen && <Store onClose={() => setIsStoreOpen(false)} />}
    </div>
  );
};

export default App;
