// src/contracts/GameStateContract.ts

import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers";
import { PlayerState, WorldState } from "../types/types";
import gameStateABI from "../abis/ChainsEnd_GameState.json";

// Deployed contract address
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Create a provider and signer (assuming MetaMask is used)
const provider = new JsonRpcProvider("http://127.0.0.1:8545"); // For Hardhat
// const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const gameStateContract = new ethers.Contract(
  contractAddress,
  gameStateABI.abi,
  await signer
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
      round: worldState.round.toNumber(), // BigNumber conversion
      numPlayers: worldState.numPlayers.toNumber(),
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

    // Assuming `playerState` is an array or object from Solidity that matches `PlayerState` interface
    return {
      level: playerState.level.toNumber(), // BigNumber conversion
      exp: playerState.exp.toNumber(),
      isActive: playerState.isActive,
      lastPlayTime: playerState.lastPlayTime.toNumber(),
    };
  } catch (error) {
    console.error("Error getting player state:", error);
    throw error; // Optionally rethrow the error if the caller needs to handle it
  }
};
