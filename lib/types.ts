export type Difficulty = "Easy" | "Medium" | "Hard" | "Chaos";

export type PunishmentMode = "Funny" | "Evil";

export type Player = {
  id: string;
  name: string;
  color: string;
  isReady: boolean;
  progress: number;
  penalties: number;
  isHost: boolean;
};

export type Room = {
  code: string;
  players: Player[];
  difficulty: Difficulty;
  punishmentMode: PunishmentMode;
  status: string;
};

export type GameState = {
  board: number[][];
  solution: number[][];
  selectedCell: [number, number] | null;
  notes: number[][][];
  startTime: number;
};
