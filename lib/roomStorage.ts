import type { Difficulty } from "@/lib/types";

export const ROOM_SESSION_KEY = "sudoparty-room-session";

export type RoomSession = {
  roomCode: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  difficulty?: Difficulty;
  isHost: boolean;
};

export function generatePlayerId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function saveRoomSession(session: RoomSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROOM_SESSION_KEY, JSON.stringify(session));
}

export const WIN_SUMMARY_KEY = "sudoparty-win-summary";

export type WinSummary = {
  roomCode: string;
  totalSeconds: number;
  mistakes: number;
  winnerId?: string;
  winnerName?: string;
  winnerColor?: string;
  punishment?: string;
  leaderboard?: Array<{
    id: string;
    name: string;
    color: string;
    progress: number;
  }>;
};

export function saveWinSummary(summary: WinSummary): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WIN_SUMMARY_KEY, JSON.stringify(summary));
}

export function readWinSummary(): WinSummary | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(WIN_SUMMARY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WinSummary;
  } catch {
    return null;
  }
}
