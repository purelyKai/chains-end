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
    uint256 expDropped;
    bool exists;
    bool isDead;
  }

  struct Item {
    uint256 id;
    string name;
    string description;
    uint256 price;
    string image;
    bool exists;
  }

  GameState public gameState;
  
  mapping(address => Player) public players;
  mapping(address => uint256) public playerCoins;
  address[] public playerAddresses;

  mapping(uint256 => Mob) public mobs;
  uint256 public mobCount;

  mapping(uint256 => Item) public storeItems;
  uint256 public itemCount;

  mapping(address => mapping(uint256 => bool)) public playerItems;

  // Events for important state changes
  event PlayerCreated(address indexed playerAddress, uint256 initialStage, uint256 initialLevel, uint256 initialHealth);
  event PlayerLeveledUp(address indexed playerAddress, uint256 newLevel);
  event PlayerHealthUpdated(address indexed playerAddress, uint256 newHealth);
  event PlayerStageCleared(address indexed playerAddresses, uint256 newStage);
  event MobCreated(uint256 indexed mobId, string name, EnemyType enemyType, uint256 health, uint256 attack, uint256 coinsDropped, uint256 expDropped);
  event ItemPurchased(address indexed playerAddress, uint256 itemId);
  event ItemAddedToStore(uint256 itemId, string itemName);

  modifier playerExists(address _playerAddress) {
    require(players[_playerAddress].exists, "Player does not exist");
    _;
  }

  constructor() {
    gameState = GameState({
      totalPlayers: 0
    });

    // Initialize store items
    addItemToStore(1, "Ethereum Sword", "A powerful sword infused with Ethereum's might", 100, "/eth-sword.png");
    addItemToStore(2, "Bitcoin Shield", "An unbreakable shield forged from Bitcoin", 150, "/btc-shield.png");
    addItemToStore(3, "Chainlink Boots", "Boots that grant incredible speed and agility", 10, "/link-boots.png");
    addItemToStore(4, "Polkadot Armor", "Armor that connects and protects", 200, "/dot-armor.png");
    addItemToStore(5, "Cardano Bow", "A precise and powerful bow", 120, "/ada-bow.png");
    addItemToStore(6, "Solana Cloak", "A cloak that grants stealth and speed", 80, "/sol-cloak.png");

  }

  function getGameState() public view returns (GameState memory) {
    return gameState;
  }

  function addItemToStore(uint256 _id, string memory _name, string memory _description, uint256 _price, string memory _image) internal {
    require(!storeItems[_id].exists, "Item ID already exists");

    storeItems[_id] = Item({
      id: _id,
      name: _name,
      description: _description,
      price: _price,
      image: _image,
      exists: true
    });

    itemCount++;
    emit ItemAddedToStore(_id, _name);
  }

  function purchaseItem(uint256 _itemId) public playerExists(msg.sender) {
    require(storeItems[_itemId].exists, "Item does not exist");
    require(!playerItems[msg.sender][_itemId], "Item already owned");
    require(players[msg.sender].coins >= storeItems[_itemId].price, "Not enough coins");

    // Deduct the item's price from the player's coins
    players[msg.sender].coins -= storeItems[_itemId].price;

    // Mark the item as owned by the player
    playerItems[msg.sender][_itemId] = true;

    emit ItemPurchased(msg.sender, _itemId);
  }

  function getPlayerItems(address _playerAddress) public view playerExists(_playerAddress) returns (bool[] memory) {
    bool[] memory itemsOwned = new bool[](itemCount);

    for (uint256 i = 1; i <= itemCount; i++) {
      itemsOwned[i - 1] = playerItems[_playerAddress][i];
    }

    return itemsOwned;
  }

  function getStoreItem(uint256 _itemId) public view returns (Item memory) {
    require(storeItems[_itemId].exists, "Item does not exist");
    return storeItems[_itemId];
  }

  function getAllStoreItems() public view returns (Item[] memory) {
    Item[] memory allItems = new Item[](itemCount);

    for (uint256 i = 1; i <= itemCount; i++) {
      allItems[i - 1] = storeItems[i];
    }

    return allItems;
  }

  function getPlayerInfo() public view returns (Player memory) {
    require(players[msg.sender].exists, "Player does not exist");
    return players[msg.sender];
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

  function createSlime() public returns (uint256) {
    mobCount++;

    mobs[mobCount] = Mob({
      id: mobCount,
      name: "Basic Slime",
      enemyType: EnemyType.Slime,
      health: 15,
      attack: 10,
      coinsDropped: 5,
      expDropped: 40,
      exists: true,
      isDead: false
    });
    emit MobCreated(mobCount, "Basic Slime", EnemyType.Slime, 15, 10, 5, 40);

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
      coinsDropped: 20,
      expDropped: 60,
      exists: true,
      isDead: false
    });
    emit MobCreated(mobCount, "Forest Goblin", EnemyType.Goblin, 30, 15, 20, 60);

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
      coinsDropped: 100,
      expDropped: 150,
      exists: true,
      isDead: false
    });
    emit MobCreated(mobCount, "Chainverse Destroyer", EnemyType.Boss, 100, 25, 100, 150);

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
      addExperience(mobs[_mobId].expDropped);
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
