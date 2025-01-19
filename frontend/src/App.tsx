import { useState, useEffect } from "react";
import ConnectWallet from "./components/connect";
import { Game } from "./components/game";
import {
  getGameState,
  createPlayer,
  getPlayerCoins,
} from "./contracts/gameState";
import Store from "./components/store";
import Music from "./components/music";

const App = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
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

    const handleKeyPress = async (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        setHasStartedGame(true);
        await createPlayer();
      } else if (event.key === "t" || event.key === "T") {
        setIsStoreOpen(true);
      }
    };

    // Add the event listener
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const updateWalletInfo = async (address: string) => {
    const balance = await getPlayerCoins();
    setWalletAddress(address);
    setWalletBalance(balance);
  };

  if (hasStartedGame) {
    return (
      <>
        <Music />
        <div className="bg-black w-screen h-screen flex items-center justify-center">
          <div className="w-full h-1/2">
            <Game />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Music />
      <div
        className="relative w-screen h-screen flex flex-col items-center justify-center bg-cover bg-center font-[VP-Pixel]"
        style={{ backgroundImage: "url('/splash.png')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.5)_100%)] pointer-events-none"></div>

        {/* Header */}
        <div className="z-10 text-center px-4 w-full pt-48">
          <h1 className="text-7xl font-bold text-gray-300 mb-6 tracking-wider">
            Chain's End
          </h1>
          <p className="text-2xl text-gray-300 mb-10">
            Descend into the Cryptic Depths of the Blockchain Dungeon
          </p>
        </div>

        {/* Main Content */}
        <div className="z-10 flex flex-col items-center justify-start flex-grow w-full px-4 ">
          {!walletAddress ? (
            <ConnectWallet onWalletConnect={updateWalletInfo} />
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-2xl text-green-400">
                {gameState?.totalPlayers || "No"} Brave Soul
                {gameState?.totalPlayers ? " Has" : "s Have"} Entered the
                Dungeon
              </p>
              <div className="flex flex-col text-lg text-gray-300">
                <div>"enter" to explore dungeon</div>
                <div>"t" to open fragment shop</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Wallet Info */}
        <div className="z-10 w-full p-3">
          <div className="">
            <p className="text-green-400 text-md truncate">
              &gt; Address: {walletAddress || "Not Connected"}
            </p>
            <p className="text-green-400 text-md">
              &gt; Balance: {walletBalance ? `${walletBalance} FRAG` : "N/A"}
            </p>
          </div>
        </div>

        {isStoreOpen && <Store onClose={() => setIsStoreOpen(false)} />}
      </div>
    </>
  );
};

export default App;
