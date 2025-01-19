// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GameStateManager {

  struct GameState {
    uint256 totalPlayers;
  }

  // Struct to represent a player
  struct Player {
    uint256 stage;
    uint256 level;
    uint256 experience;
    uint256 health;
    uint256 createdAt;
    bool exists;
  }
  
  // Game state variable
  GameState public gameState;
  
  // Mapping from address to Player struct
  mapping(address => Player) public players;
  
  address[] public playerAddresses;

  // Events for important state changes
  event PlayerCreated(address indexed playerAddress, uint256 initialStage, uint256 initialLevel, uint256 initialHealth);
  event PlayerLeveledUp(address indexed playerAddress, uint256 newLevel);
  event PlayerHealthUpdated(address indexed playerAddress, uint256 newHealth);
  
  modifier playerExists(address _playerAddress) {
    require(players[_playerAddress].exists, "Player does not exist");
    _;
  }

  constructor() {
    gameState = GameState({
      totalPlayers: 0
    });
  }

  function getGameState() public view returns (GameState memory) {
    return gameState;
  }

  function createPlayer() public {
    require(!players[msg.sender].exists, "Player already exists");

    players[msg.sender] = Player({
      stage: 1,
      level: 1,
      health: 100,
      experience: 0,
      createdAt: block.timestamp,
      exists: true
    });

    gameState.totalPlayers++;

    playerAddresses.push(msg.sender);
    emit PlayerCreated(msg.sender, 1, 1, 100);
  }
  
  function levelUp() public playerExists(msg.sender) {
    players[msg.sender].level++;
    players[msg.sender].health = 100;

    emit PlayerLeveledUp(msg.sender, players[msg.sender].level);
  }
  
  function updateHealth(uint256 _newHealth) public playerExists(msg.sender) {
    require(_newHealth <= 100, "Health cannot exceed 100");
    
    players[msg.sender].health = _newHealth;

    emit PlayerHealthUpdated(msg.sender, _newHealth);
  }
  
  function addExperience(uint256 _exp) public playerExists(msg.sender) {
    players[msg.sender].experience += _exp;

    if (players[msg.sender].experience >= (players[msg.sender].level * 100)) {
      levelUp();
    }
  }
  
  function getPlayerInfo() public view returns (Player memory) {
    require(players[msg.sender].exists, "Player does not exist");
    return players[msg.sender];
  }
}
