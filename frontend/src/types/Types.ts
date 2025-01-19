export type WorldState = {
  round: number;
  numPlayers: number;
  isPaused: boolean;
}

export type PlayerState = {
  level: number;
  exp: number;
  isActive: boolean;
  lastPlayTime: number;
}
