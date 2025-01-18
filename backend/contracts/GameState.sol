// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GameState {
    // Struct to represent a player
    struct Player {
        address addr;
        uint256 level;
        uint256 experience;
        bool isActive;
        uint256 lastPlayTime;
        // Add more player attributes as needed
    }
    
    // Struct to represent game world state
    struct WorldState {
        uint256 currentRound;
        uint256 totalPlayers;
        bool isPaused;
        // Add more global state variables as needed
    }
    
    // Mapping from address to Player struct
    mapping(address => Player) public players;
    
    // Global game state
    WorldState public worldState;
    
    // Events for important state changes
    event PlayerJoined(address indexed player);
    event PlayerUpdated(address indexed player, uint256 newLevel, uint256 newExp);
    event WorldStateUpdated(uint256 round, bool isPaused);
    
    constructor() {
        worldState = WorldState({
            currentRound: 0,
            totalPlayers: 0,
            isPaused: false
        });
    }
    
    // Function to join the game
    function joinGame() external {
        require(!players[msg.sender].isActive, "Player already exists");
        
        players[msg.sender] = Player({
            addr: msg.sender,
            level: 1,
            experience: 0,
            isActive: true,
            lastPlayTime: block.timestamp
        });
        
        worldState.totalPlayers++;
        emit PlayerJoined(msg.sender);
    }
    
    // Function to update player state
    function updatePlayerState(uint256 newLevel, uint256 newExp) external {
        require(players[msg.sender].isActive, "Player does not exist");
        
        Player storage player = players[msg.sender];
        player.level = newLevel;
        player.experience = newExp;
        player.lastPlayTime = block.timestamp;
        
        emit PlayerUpdated(msg.sender, newLevel, newExp);
    }
    
    // Function to update world state
    function updateWorldState(uint256 newRound, bool isPaused) external {
        // Add access control here
        worldState.currentRound = newRound;
        worldState.isPaused = isPaused;
        
        emit WorldStateUpdated(newRound, isPaused);
    }
    
    // Function to get player state
    function getPlayerState(address playerAddr) external view 
        returns (uint256 level, uint256 exp, bool isActive, uint256 lastPlayTime) 
    {
        Player memory player = players[playerAddr];
        return (player.level, player.experience, player.isActive, player.lastPlayTime);
    }
    
    // Function to get world state
    function getWorldState() external view 
        returns (uint256 round, uint256 numPlayers, bool isPaused) 
    {
        return (worldState.currentRound, worldState.totalPlayers, worldState.isPaused);
    }
}
