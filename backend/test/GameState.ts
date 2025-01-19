import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

// Sample fixture to deploy the GameState contract
async function deployGameStateFixture() {
  const [owner, player1, player2] = await hre.ethers.getSigners();

  // Assume GameState contract has a constructor with no parameters
  const GameState = await hre.ethers.getContractFactory("GameState");
  const gameState = await GameState.deploy();

  return { gameState, owner, player1, player2 };
}

describe("GameState Contract", function () {
  describe("Deployment", function () {
    it("Should set the initial world state", async function () {
      const { gameState } = await loadFixture(deployGameStateFixture);
      const worldState = await gameState.getWorldState();
      expect(worldState.round).to.equal(0); // Assuming the default round is 0
      expect(worldState.numPlayers).to.equal(0); // Assuming no players at start
      expect(worldState.isPaused).to.equal(false); // Assuming the game is not paused initially
    });
  });

  describe("Joining the Game", function () {
    it("Should allow a player to join the game", async function () {
      const { gameState, player1 } = await loadFixture(deployGameStateFixture);
      await gameState.connect(player1).joinGame();

      const playerState = await gameState.getPlayerState(player1.address);
      expect(playerState.isActive).to.equal(true);
      expect(playerState.level).to.equal(1); // Default level is 1
    });

    it("Should revert if the same player tries to join again", async function () {
      const { gameState, player1 } = await loadFixture(deployGameStateFixture);
      await gameState.connect(player1).joinGame();

      await expect(gameState.connect(player1).joinGame()).to.be.revertedWith(
        "Player already exists"
      );
    });
  });

  describe("Leaving the Game", function () {
    it("Should allow a player to leave the game", async function () {
      const { gameState, player1 } = await loadFixture(deployGameStateFixture);
      await gameState.connect(player1).joinGame();

      await expect(gameState.connect(player1).leaveGame())
        .to.emit(gameState, "PlayerLeft")
        .withArgs(player1.address);

      const playerState = await gameState.getPlayerState(player1.address);
      expect(playerState.isActive).to.equal(false); // Player is no longer active
    });
  });

  describe("Rejoining the Game", function () {
    it("Should allow a player to rejoin the game and retain level/experience", async function () {
      const { gameState, player1 } = await loadFixture(deployGameStateFixture);
      await gameState.connect(player1).joinGame();

      const initialLevel = 5;
      const initialExp = 200;
      await gameState
        .connect(player1)
        .updatePlayerState(initialLevel, initialExp);

      await gameState.connect(player1).leaveGame();

      // Rejoin the game
      await expect(gameState.connect(player1).rejoinGame())
        .to.emit(gameState, "PlayerRejoined")
        .withArgs(player1.address);

      const playerState = await gameState.getPlayerState(player1.address);
      expect(playerState.isActive).to.equal(true); // Player is now active again
      expect(playerState.level).to.equal(initialLevel); // Level is retained
      expect(playerState.exp).to.equal(initialExp); // Experience is retained
    });
  });

  describe("Updating State", function () {
    it("Should allow the player to update their state", async function () {
      const { gameState, player1 } = await loadFixture(deployGameStateFixture);
      await gameState.connect(player1).joinGame();

      const newLevel = 2;
      const newExp = 100;

      await gameState.connect(player1).updatePlayerState(newLevel, newExp);

      const playerState = await gameState.getPlayerState(player1.address);
      expect(playerState.level).to.equal(newLevel);
      expect(playerState.exp).to.equal(newExp);
    });

    it("Should allow the owner to update world state", async function () {
      const { gameState, owner } = await loadFixture(deployGameStateFixture);

      const newRound = 2;
      const isPaused = true;

      await gameState.connect(owner).updateWorldState(newRound, isPaused);

      const worldState = await gameState.getWorldState();
      expect(worldState.round).to.equal(newRound);
      expect(worldState.isPaused).to.equal(isPaused);
    });

    it("Should revert if a non-owner tries to update world state", async function () {
      const { gameState, player1 } = await loadFixture(deployGameStateFixture);
      await expect(
        gameState.connect(player1).updateWorldState(1, true)
      ).to.be.revertedWith("Only the owner can perform this action");
    });
  });

  describe("Events", function () {
    it("Should emit an event when a player joins the game", async function () {
      const { gameState, player1 } = await loadFixture(deployGameStateFixture);

      await expect(gameState.connect(player1).joinGame())
        .to.emit(gameState, "PlayerJoined")
        .withArgs(player1.address);
    });

    it("Should emit an event when a player leaves the game", async function () {
      const { gameState, player1 } = await loadFixture(deployGameStateFixture);
      await gameState.connect(player1).joinGame();

      await expect(gameState.connect(player1).leaveGame())
        .to.emit(gameState, "PlayerLeft")
        .withArgs(player1.address);
    });

    it("Should emit an event when the world state is updated", async function () {
      const { gameState, owner } = await loadFixture(deployGameStateFixture);

      const newRound = 1;
      const isPaused = true;

      await expect(
        gameState.connect(owner).updateWorldState(newRound, isPaused)
      )
        .to.emit(gameState, "WorldStateUpdated")
        .withArgs(newRound, isPaused);
    });
  });

  describe("State Validations", function () {
    it("Should revert if player state update is invalid", async function () {
      const { gameState, player1 } = await loadFixture(deployGameStateFixture);
      await gameState.connect(player1).joinGame();

      await expect(
        gameState.connect(player1).updatePlayerState(0, 0) // Invalid level/exp
      ).to.be.revertedWith("Invalid player state update"); // Change revert reason if needed
    });
  });
});
