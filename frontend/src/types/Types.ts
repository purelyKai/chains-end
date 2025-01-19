export interface WorldState {
  round: number;
  numPlayers: number;
  isPaused: boolean;
}

export interface PlayerState {
  level: number;
  exp: number;
  isActive: boolean;
  lastPlayTime: number;
}
