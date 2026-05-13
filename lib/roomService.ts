import { get, onValue, ref, update, set } from "firebase/database";

import { db } from "@/lib/firebase";
import { getPuzzle } from "@/lib/sudokuPuzzle";
import type { Difficulty } from "@/lib/types";

export type FirebasePlayer = {
  name: string;
  color: string;
  isReady: boolean;
  isHost: boolean;
  progress: number;
  penalties: number;
  finished?: boolean;
};

export type FirebaseRoom = {
  code: string;
  difficulty: Difficulty | string;
  status: "waiting" | "playing" | "finished";
  hostId: string;
  puzzle: number[][];
  solution: number[][];
  createdAt: number;
  startedAt?: number;
  winnerId?: string;
  winnerName?: string;
  winnerColor?: string;
  punishment?: string;
  players: Record<string, FirebasePlayer>;
  moves?: Record<string, { value: number; timestamp: number }>;
};

export async function createRoom(
  roomCode: string,
  hostPlayer: { id: string; name: string; color: string; isReady?: boolean },
  difficulty: Difficulty,
): Promise<void> {
  const puzzleSet = getPuzzle(difficulty);

  await set(ref(db, `rooms/${roomCode}`), {
    code: roomCode,
    difficulty,
    status: "waiting",
    hostId: hostPlayer.id,
    puzzle: puzzleSet.puzzle.map((row) => [...row]),
    solution: puzzleSet.solution.map((row) => [...row]),
    createdAt: Date.now(),
    players: {
      [hostPlayer.id]: {
        name: hostPlayer.name,
        color: hostPlayer.color,
        isReady: hostPlayer.isReady ?? true,
        isHost: true,
        progress: 0,
        penalties: 0,
      },
    },
  });
}

export async function joinRoom(
  roomCode: string,
  player: { id: string; name: string; color: string },
): Promise<void> {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  if (!snap.exists()) {
    throw new Error("ROOM_NOT_FOUND");
  }
  await update(ref(db, `rooms/${roomCode}`), {
    [`players/${player.id}`]: {
      name: player.name,
      color: player.color,
      isReady: false,
      isHost: false,
      progress: 0,
      penalties: 0,
    },
  });
}

export function listenToRoom(
  roomCode: string,
  callback: (room: FirebaseRoom | null) => void,
): () => void {
  const roomRef = ref(db, `rooms/${roomCode}`);
  return onValue(roomRef, (snapshot) => {
    callback(snapshot.val() as FirebaseRoom | null);
  });
}

export async function updatePlayerProgress(
  roomCode: string,
  playerId: string,
  progress: number,
  penalties: number,
  opts?: { finished?: boolean },
): Promise<void> {
  const payload: Record<string, unknown> = {
    progress,
    penalties,
  };
  if (opts?.finished === true) payload.finished = true;

  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), payload);
}

export async function setPlayerReady(
  roomCode: string,
  playerId: string,
  isReady: boolean,
): Promise<void> {
  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
    isReady,
  });
}

export async function startGame(roomCode: string): Promise<void> {
  await update(ref(db, `rooms/${roomCode}`), {
    status: "playing",
    startedAt: Date.now(),
  });
}

export async function updateCell(
  roomCode: string,
  playerId: string,
  row: number,
  col: number,
  value: number,
): Promise<void> {
  const moveKey = `${playerId}_${row}_${col}`;
  await update(ref(db, `rooms/${roomCode}/moves`), {
    [moveKey]: { value, timestamp: Date.now() },
  });
}
