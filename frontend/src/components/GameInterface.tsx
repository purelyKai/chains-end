import { useState } from "react";
import { PlayerState, WorldState } from "../types/Types";
import {
  joinGame,
  getWorldState,
  getPlayerState,
} from "../contracts/GameStateContract";

interface GameInterfaceProps {
  walletAddress: string;
}

const GameInterface = ({ walletAddress }: GameInterfaceProps) => {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [worldState, setWorldState] = useState<WorldState | null>(null);

  const handleJoinGame = async () => {
    await joinGame();
  };

  const handleGetPlayerState = async () => {
    const state = await getPlayerState(walletAddress);
    setPlayerState(state);
  };

  const handleGetWorldState = async () => {
    const state = await getWorldState();
    setWorldState(state);
  };

  return (
    <div>
      <h2>Welcome, {walletAddress}</h2>
      <button onClick={handleJoinGame}>Join Game</button>
      <button onClick={handleGetWorldState}>Get World State</button>
      <button onClick={handleGetPlayerState}>Get Player State</button>

      <div>
        {worldState && (
          <div>
            <h3>World State:</h3>
            <p>Round: {worldState.round}</p>
            <p>Number of Players: {worldState.numPlayers}</p>
            <p>Is Paused: {worldState.isPaused ? "Yes" : "No"}</p>
          </div>
        )}
      </div>

      <div>
        {playerState && (
          <div>
            <h3>Player State:</h3>
            <p>Level: {playerState.level}</p>
            <p>Experience: {playerState.exp}</p>
            <p>Active: {playerState.isActive ? "Yes" : "No"}</p>
            <p>
              Last Play Time:{" "}
              {new Date(playerState.lastPlayTime * 1000).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameInterface;
