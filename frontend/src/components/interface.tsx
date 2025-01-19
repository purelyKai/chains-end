import { useState, useEffect } from "react";
import { PlayerState, WorldState } from "../types/types";
import {
  joinGame,
  getWorldState,
  getPlayerState,
  updatePlayerState,
  updateWorldState,
  leaveGame,
  rejoinGame,
} from "../contracts/gameState";

type GameInterfaceProps = {
  walletAddress: string;
};

const GameInterface = ({ walletAddress }: GameInterfaceProps) => {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [worldState, setWorldState] = useState<WorldState | null>(null);

  const [newLevel, setNewLevel] = useState<number>(1);
  const [newExp, setNewExp] = useState<number>(0);
  const [newRound, setNewRound] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [currentGameStatus, setCurrentGameStatus] = useState<string>("");

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const playerState = await getPlayerState(walletAddress);
        setPlayerState(playerState);
        setCurrentPlayer(
          playerState && playerState.isActive ? "Active" : "Inactive"
        );

        const worldState = await getWorldState();
        setWorldState(worldState);
        setCurrentGameStatus(
          worldState ? (worldState.isPaused ? "Paused" : "Running") : "No Game"
        );
      } catch (error) {
        console.error("Error fetching states", error);
      }
    };

    fetchStates();
  }, [walletAddress]);

  const handleJoinGame = async () => {
    await joinGame();
    await refreshState();
  };

  const handleLeaveGame = async () => {
    await leaveGame();
    await refreshState();
  };

  const handleRejoinGame = async () => {
    await rejoinGame();
    await refreshState();
  };

  const refreshState = async () => {
    try {
      const updatedPlayerState = await getPlayerState(walletAddress);
      setPlayerState(updatedPlayerState);
      setCurrentPlayer(
        updatedPlayerState
          ? updatedPlayerState.isActive
            ? "Active"
            : "Inactive"
          : "No Player"
      );

      const updatedWorldState = await getWorldState();
      setWorldState(updatedWorldState);
      setCurrentGameStatus(
        updatedWorldState
          ? updatedWorldState.isPaused
            ? "Paused"
            : "Running"
          : "No Game"
      );
    } catch (error) {
      console.error("Error refreshing states", error);
    }
  };

  const handleGetPlayerState = async () => {
    const state = await getPlayerState(walletAddress);
    setPlayerState(state);
    setCurrentPlayer(
      state ? (state.isActive ? "Active" : "Inactive") : "No Player"
    );
  };

  const handleGetWorldState = async () => {
    const state = await getWorldState();
    setWorldState(state);
    setCurrentGameStatus(
      state ? (state.isPaused ? "Paused" : "Running") : "No Game"
    );
  };

  const handleUpdatePlayerState = async () => {
    await updatePlayerState(newLevel, newExp);
    await refreshState();
  };

  const handleUpdateWorldState = async () => {
    await updateWorldState(newRound, isPaused);
    await refreshState();
  };

  return (
    <div>
      <h2>Welcome, {walletAddress}</h2>

      <button onClick={handleJoinGame}>Join Game</button>
      <button onClick={handleLeaveGame}>Leave Game</button>
      <button onClick={handleRejoinGame}>Rejoin Game</button>
      <button onClick={handleGetWorldState}>Get World State</button>
      <button onClick={handleGetPlayerState}>Get Player State</button>

      <div>
        <h3>Current Player Status:</h3>
        <p>{currentPlayer}</p>
      </div>

      <div>
        <h3>Current Game Status:</h3>
        <p>{currentGameStatus}</p>
      </div>

      {worldState ? (
        <div>
          <h3>World State:</h3>
          <p>Round: {worldState.currentRound}</p>
          <p>Number of Players: {worldState.totalPlayers}</p>
          <p>Is Paused: {worldState.isPaused ? "Yes" : "No"}</p>
        </div>
      ) : (
        <p>Loading world state...</p>
      )}

      {playerState ? (
        <div>
          <h3>Player State:</h3>
          <p>Level: {playerState.level}</p>
          <p>Experience: {playerState.experience}</p>
          <p>Active: {playerState.isActive ? "Yes" : "No"}</p>
          <p>
            Last Play Time:{" "}
            {new Date(playerState.lastPlayTime * 1000).toLocaleString()}
          </p>
        </div>
      ) : (
        <p>Loading player state...</p>
      )}

      <div>
        <h3>Update Player State:</h3>
        <label>
          New Level:
          <input
            type="number"
            value={newLevel}
            onChange={(e) => setNewLevel(Number(e.target.value))}
          />
        </label>
        <br />
        <label>
          New Experience:
          <input
            type="number"
            value={newExp}
            onChange={(e) => setNewExp(Number(e.target.value))}
          />
        </label>
        <br />
        <button onClick={handleUpdatePlayerState}>Update Player State</button>
      </div>

      <div>
        <h3>Update World State:</h3>
        <label>
          New Round:
          <input
            type="number"
            value={newRound}
            onChange={(e) => setNewRound(Number(e.target.value))}
          />
        </label>
        <br />
        <label>
          Is Paused:
          <input
            type="checkbox"
            checked={isPaused}
            onChange={(e) => setIsPaused(e.target.checked)}
          />
        </label>
        <br />
        <button onClick={handleUpdateWorldState}>Update World State</button>
      </div>
    </div>
  );
};

export default GameInterface;
