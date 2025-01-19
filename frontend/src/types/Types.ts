export type WorldState = {
  currentRound: number;
  totalPlayers: number;
  isPaused: boolean;
};

export type PlayerState = {
  level: number;
  experience: number;
  isActive: boolean;
  lastPlayTime: number;
};
