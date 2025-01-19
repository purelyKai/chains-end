// src/contracts/GameStateContract.ts

import { ethers } from "ethers";
import gameStateABI from "../abis/ChainsEnd_GameState.json";

// Deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Create a provider and signer (assuming MetaMask is used)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // For Hardhat
// const provider = new ethers.Web3Provider(window.ethereum);
const signer = await provider.getSigner();
const gameStateContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  gameStateABI.abi,
  signer
);

export async function createPlayer() {
  try {
    // Get contract instance
    const contract = gameStateContract;

    // Call create player function
    const tx = await contract.createPlayer();

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.error("Error creating player", error);
    throw error;
  }
}

export async function getPlayerInfo() {
  try {
    // Get contract instance
    const contract = gameStateContract;

    // Call get player info function
    const playerInfo = await contract.getPlayerInfo();

    // Convert BigNumber to regular numbers
    return {
      stage: Number(playerInfo.stage),
      level: Number(playerInfo.level),
      experience: Number(playerInfo.experience),
      health: Number(playerInfo.health),
      createdAt: new Date(Number(playerInfo.createdAt)),
      exists: playerInfo.exists,
    };
  } catch (error) {
    console.error("Error getting player info", error);
    throw error;
  }
}

export async function getGameState() {
  try {
    // Get contract instance
    const contract = gameStateContract;

    // Call get game state function
    const gameState = await contract.getGameState();

    // Convert BigNumber to regular number
    return {
      totalPlayers: Number(gameState.totalPlayers),
    };
  } catch (error) {
    console.error("Error getting game state", error);
    throw error;
  }
}

export async function createMob(name: string) {
  if (name == "slime") {
    try {
      const contract = gameStateContract
    
      const tx = await contract.createSlime();
      const receipt = await tx.wait();

      const mobCreatedLog = receipt.logs.find(log => 
        contract.interface.parseLog(log)?.name === 'MobCreated'
      );
      const parsedLog = contract.interface.parseLog(mobCreatedLog);
      const mobId = parsedLog.args[0];
      
      const mobInfo = await contract.getMob(mobId);
      
      return {
        id: Number(mobInfo.id),
        name: mobInfo.name,
        enemyType: mobInfo.enemyType,
        health: Number(mobInfo.health),
        attack: Number(mobInfo.attack),
        coinsDropped: Number(mobInfo.coinsDropped),
        exists: mobInfo.exists,
        isDead: mobInfo.isDead
      };
    } catch (error) {
      console.error('Error creating slime mob', error);
      throw error;
    }
  } else if (name == "goblin") {
    try {
      const contract = gameStateContract
    
      const tx = await contract.createGoblin();
      
      const receipt = await tx.wait();
      
      const mobId = receipt.events?.[0]?.args?.[0];
      
      const mobInfo = await contract.getMob(mobId);
      
      return {
        id: Number(mobInfo.id),
        name: mobInfo.name,
        enemyType: mobInfo.enemyType,
        health: Number(mobInfo.health),
        attack: Number(mobInfo.attack),
        coinsDropped: Number(mobInfo.coinsDropped),
        exists: mobInfo.exists,
        isDead: mobInfo.isDead
      };
    } catch (error) {
      console.error('Error creating slime mob', error);
      throw error;
    }
  } else {
    try {
      const contract = gameStateContract
    
      const tx = await contract.createBoss();
      
      const receipt = await tx.wait();
      
      const mobId = receipt.events?.[0]?.args?.[0];
      
      const mobInfo = await contract.getMob(mobId);
      
      return {
        id: Number(mobInfo.id),
        name: mobInfo.name,
        enemyType: mobInfo.enemyType,
        health: Number(mobInfo.health),
        attack: Number(mobInfo.attack),
        coinsDropped: Number(mobInfo.coinsDropped),
        exists: mobInfo.exists,
        isDead: mobInfo.isDead
      };
    } catch (error) {
      console.error('Error creating slime mob', error);
      throw error;
    }
  }
}

export async function updateMobHealth(mobId: number, damage: number) {
  try {
    const contract = gameStateContract

    const tx = await contract.updateMobHealth(mobId, damage);
    
    const receipt = await tx.wait();
    
    return receipt;
  } catch (error) {
    console.error('Error updating mob health', error);
    throw error;
  }
}

export async function getPlayerCoins() {
  try {
    const contract = gameStateContract
    
    const coins = await contract.getPlayerCoins();
    
    return Number(coins)
  } catch (error) {
    console.error('Error getting player coins', error);
    throw error;
  }
}

export async function getMob(mobId: number) {
  try {
    const contract = gameStateContract
    
    const mob = await contract.getMob(mobId);
    
    return {
      id: Number(mob.id),
      name: mob.name,
      enemyType: mob.enemyType,
      health: Number(mob.health),
      attack: Number(mob.attack),
      coinsDropped: Number(mob.coinsDropped),
      exists: mob.exists
    };
  } catch (error) {
    console.error('Error getting mob', error);
    throw error;
  }
}