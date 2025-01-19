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
    uint256 coins;
    uint256 createdAt;
    bool exists;
  }

  enum EnemyType { 
    Slime, 
    Goblin,
    Boss
  }

  struct Mob {
    uint256 id;
    string name;
    EnemyType enemyType;
    uint256 health;
    uint256 attack;
    uint256 coinsDropped;
    bool exists;
    bool isDead;
  }

  GameState public gameState;
  
  mapping(address => Player) public players;
  mapping(address => uint256) public playerCoins;
  address[] public playerAddresses;

  mapping(uint256 => Mob) public mobs;
  uint256 public mobCount;

  uint256 public itemCount;
  uint256 public enemyCount;

  // Events for important state changes
  event PlayerCreated(address indexed playerAddress, uint256 initialStage, uint256 initialLevel, uint256 initialHealth);
  event PlayerLeveledUp(address indexed playerAddress, uint256 newLevel);
  event PlayerHealthUpdated(address indexed playerAddress, uint256 newHealth);
  event PlayerStageCleared(address indexed playerAddresses, uint256 newStage);
  event MobCreated(uint256 indexed mobId, string name, EnemyType enemyType, uint256 health, uint256 attack, uint256 coinsDropped);
  
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
      experience: 0,
      health: 100,
      coins: 0,
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

  function stageCleared() public playerExists(msg.sender) {
    players[msg.sender].stage++;

    emit PlayerStageCleared(msg.sender, players[msg.sender].stage);
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

  function createSlime() public returns (uint256) {
    mobCount++;

    mobs[mobCount] = Mob({
      id: mobCount,
      name: "Basic Slime",
      enemyType: EnemyType.Slime,
      health: 15,
      attack: 10,
      coinsDropped: 5,
      exists: true,
      isDead: false
    });
    emit MobCreated(mobCount, "Basic Slime", EnemyType.Slime, 15, 10, 5);

    return mobCount;
  }

  function createGoblin() public returns (uint256) {
    mobCount++;

    mobs[mobCount] = Mob({
      id: mobCount,
      name: "Forest Goblin",
      enemyType: EnemyType.Goblin,
      health: 30,
      attack: 15,
      coinsDropped: 10,
      exists: true,
      isDead: false
    });
    emit MobCreated(mobCount, "Forest Goblin", EnemyType.Goblin, 30, 15, 10);

    return mobCount;
  }

  function createBoss() public returns (uint256) {
    mobCount++;

    mobs[mobCount] = Mob({
      id: mobCount,
      name: "Chainverse Destroyer",
      enemyType: EnemyType.Boss,
      health: 100,
      attack: 25,
      coinsDropped: 50,
      exists: true,
      isDead: false
    });
    emit MobCreated(mobCount, "Chainverse Destroyer", EnemyType.Boss, 100, 25, 50);

    return mobCount;
  }

  function getMob(uint256 _mobId) public view returns (Mob memory) {
    require(mobs[_mobId].exists, "Mob does not exist");
    return mobs[_mobId];
  }

  function updateMobHealth(uint256 _mobId, uint256 _damage) public {
    require(mobs[_mobId].exists, "Mob does not exist");
    require(!mobs[_mobId].isDead, "Mob is already dead");

    // Ensure damage doesn't reduce health below 0
    if (_damage >= mobs[_mobId].health) {
      mobs[_mobId].health = 0;
      mobs[_mobId].isDead = true;
    } else {
      mobs[_mobId].health -= _damage;
    }

    if (mobs[_mobId].isDead) {
      dropCoins(_mobId);
    }
  }

  function dropCoins(uint256 _mobId) internal {
    uint256 coinsToDrop = mobs[_mobId].coinsDropped;
    
    // Add coins to the player who defeated the mob
    playerCoins[msg.sender] += coinsToDrop;
  }

  function getPlayerCoins() public view returns (uint256) {
    return playerCoins[msg.sender];
  }
}
