// src/contracts/GameStateContract.ts

import { ethers } from "ethers";
import { PlayerState, WorldState } from "../types/types";
import gameStateABI from "../abis/ChainsEnd_GameState.json";

// Deployed contract address
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Create a provider and signer (assuming MetaMask is used)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // For Hardhat
// const provider = new ethers.Web3Provider(window.ethereum);
const signer = await provider.getSigner();
const gameStateContract = new ethers.Contract(
  contractAddress,
  gameStateABI.abi,
  signer
);

// Function to join the game
export const joinGame = async (): Promise<void> => {
  try {
    const tx = await gameStateContract.joinGame();
    await tx.wait(); // Wait for transaction to be mined
    console.log("Player joined the game!");
  } catch (error) {
    console.error("Error joining the game:", error);
    throw error; // Optionally rethrow the error if the caller needs to handle it
  }
};

// Function to get world state
export const getWorldState = async (): Promise<WorldState> => {
  try {
    const worldState = await gameStateContract.getWorldState();
    console.log("World State:", worldState);

    // Assuming `worldState` is an array or object from Solidity that matches `WorldState` interface
    return {
      currentRound: worldState.round.toNumber(), // BigNumber conversion
      totalPlayers: worldState.numPlayers.toNumber(),
      isPaused: worldState.isPaused,
    };
  } catch (error) {
    console.error("Error getting world state:", error);
    throw error; // Optionally rethrow the error if the caller needs to handle it
  }
};

// Function to get player state
export const getPlayerState = async (
  playerAddress: string
): Promise<PlayerState> => {
  try {
    const playerState = await gameStateContract.getPlayerState(playerAddress);
    console.log("Player State:", playerState);

    return {
      level: playerState.level.toNumber(), // BigNumber conversion
      experience: playerState.exp.toNumber(),
      isActive: playerState.isActive,
      lastPlayTime: playerState.lastPlayTime.toNumber(),
    };
  } catch (error) {
    console.error("Error getting player state:", error);
    throw error; // Optionally rethrow the error if the caller needs to handle it
  }
};

// Function to update player state
export const updatePlayerState = async (
  newLevel: number,
  newExp: number
): Promise<void> => {
  try {
    const tx = await gameStateContract.updatePlayerState(newLevel, newExp);
    await tx.wait(); // Wait for transaction to be mined
    console.log(
      `Player state updated: level ${newLevel}, experience ${newExp}`
    );
  } catch (error) {
    console.error("Error updating player state:", error);
    throw error;
  }
};

// Function to update world state
export const updateWorldState = async (
  newRound: number,
  isPaused: boolean
): Promise<void> => {
  try {
    const tx = await gameStateContract.updateWorldState(newRound, isPaused);
    await tx.wait(); // Wait for transaction to be mined
    console.log(`World state updated: round ${newRound}, paused ${isPaused}`);
  } catch (error) {
    console.error("Error updating world state:", error);
    throw error;
  }
};

// Function to rejoin the game (if player left and wants to come back)
export const rejoinGame = async (): Promise<void> => {
  try {
    const tx = await gameStateContract.rejoinGame();
    await tx.wait(); // Wait for transaction to be mined
    console.log("Player rejoined the game!");
  } catch (error) {
    console.error("Error rejoining the game:", error);
    throw error;
  }
};

// Function to leave the game
export const leaveGame = async (): Promise<void> => {
  try {
    const tx = await gameStateContract.leaveGame();
    await tx.wait(); // Wait for transaction to be mined
    console.log("Player left the game!");
  } catch (error) {
    console.error("Error leaving the game:", error);
    throw error;
  }
};
