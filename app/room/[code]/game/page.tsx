"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { PUNISHMENTS } from "@/lib/constants";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { FirebaseRoom } from "@/lib/roomService";
import { getPuzzle } from "@/lib/sudokuPuzzle";
import { ROOM_SESSION_KEY, saveWinSummary, type RoomSession } from "@/lib/roomStorage";

type CellMark = "neutral" | "correct" | "wrong";
type PlayerRow = { id: string; name: string; color: string; progress: number; isYou?: boolean };

function readRoomSession(code: string): RoomSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ROOM_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RoomSession;
    return parsed.roomCode?.toUpperCase() === code ? parsed : null;
  } catch {
    return null;
  }
}

function cloneGrid(grid: readonly (readonly number[])[]): number[][] {
  return grid.map((row) => [...row]);
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function emptyNotes(): Set<number>[][] {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set<number>()),
  );
}

const DEFAULT_SET = getPuzzle("Easy");

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const code = String(params.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

  const [session] = useState<RoomSession | null>(() => readRoomSession(code));
  const [puzzle, setPuzzle] = useState<number[][]>(() => cloneGrid(DEFAULT_SET.puzzle));
  const [solution, setSolution] = useState<number[][]>(() => cloneGrid(DEFAULT_SET.solution));
  const [board, setBoard] = useState<number[][]>(() => cloneGrid(DEFAULT_SET.puzzle));
  const [notes, setNotes] = useState(() => emptyNotes());
  const [marks, setMarks] = useState<CellMark[][]>(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => "neutral" as CellMark)),
  );
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [penaltySeconds] = useState(0);
  const [barFlash, setBarFlash] = useState(false);
  const [penaltyToastId, setPenaltyToastId] = useState(0);
  const [shakeCell, setShakeCell] = useState<[number, number] | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [eliminated, setEliminated] = useState(false);
  const [firebasePlayers, setFirebasePlayers] = useState<PlayerRow[]>([]);
  const winNavigated = useRef(false);
  const puzzleKey = useRef<string | null>(null);

  // Timer
  useEffect(() => {
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Progress calculation
  const progressPercent = useMemo(() => {
    let correct = 0;
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (puzzle[r][c] === 0 && board[r][c] === solution[r][c]) correct++;
    const totalEmpty = puzzle.flat().filter(n => n === 0).length;
    return totalEmpty ? Math.round((correct / totalEmpty) * 100) : 100;
  }, [board, puzzle, solution]);

  // Update own progress in Firebase
  useEffect(() => {
    if (!session?.playerId) return;
    update(ref(db, `rooms/${code}/players/${session.playerId}`), {
      progress: progressPercent,
      penalties: penaltySeconds,
    });
  }, [progressPercent, penaltySeconds, code, session?.playerId]);

  // Listen to Firebase for other players
  useEffect(() => {
    if (!code || !session?.playerId) return;
    const roomRef = ref(db, `rooms/${code}/players`);
    const unsub = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as FirebaseRoom["players"] | null;
      if (!data) return;
      const rows: PlayerRow[] = Object.entries(data).map(([pid, p]) => ({
        id: pid,
        name: p.name,
        color: p.color,
        progress: p.progress ?? 0,
        isYou: pid === session.playerId,
      }));
      setFirebasePlayers(rows);
    });
    return () => unsub();
  }, [code, session?.playerId]);

  // Listen for game finished by another player
  useEffect(() => {
    if (!code) return;
    const roomRef = ref(db, `rooms/${code}`);
    const unsub = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as FirebaseRoom | null;
      if (!data) return;
      if (data.puzzle && data.solution) {
        const nextPuzzleKey = JSON.stringify(data.puzzle);
        if (puzzleKey.current !== nextPuzzleKey) {
          puzzleKey.current = nextPuzzleKey;
          setPuzzle(cloneGrid(data.puzzle));
          setSolution(cloneGrid(data.solution));
          setBoard(cloneGrid(data.puzzle));
          setNotes(emptyNotes());
          setMarks(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => "neutral" as CellMark)));
          setSelected(null);
        }
      }
      if (data.status === "finished" && !winNavigated.current) {
        winNavigated.current = true;
        saveWinSummary({
          roomCode: code,
          totalSeconds: elapsed,
          mistakes: mistakeCount,
          winnerId: data.winnerId,
          winnerName: data.winnerName ?? "Champion",
          winnerColor: data.winnerColor ?? "#7C3AED",
          punishment: data.punishment ?? "",
          leaderboard: data.players
            ? Object.entries(data.players).map(([pid, p]) => ({
                id: pid,
                name: p.name,
                color: p.color,
                progress: p.progress ?? 0,
              }))
            : [],
        });
        router.push(`/room/${code}/win`);
      }
    });
    return () => unsub();
  }, [code, elapsed, mistakeCount, router, session?.playerId]);

  // Win condition — current player finished
  useEffect(() => {
    if (progressPercent < 100 || winNavigated.current || eliminated) return;
    winNavigated.current = true;
    const punishment = PUNISHMENTS[Math.floor(Math.random() * PUNISHMENTS.length)];
    const winnerId = session?.playerId;
    const roomUpdate: Record<string, unknown> = {
      status: "finished",
      winnerId,
      winnerName: session?.playerName ?? "Champion",
      winnerColor: session?.playerColor ?? "#7C3AED",
      punishment,
    };
    if (winnerId) {
      roomUpdate[`players/${winnerId}/progress`] = 100;
      roomUpdate[`players/${winnerId}/finished`] = true;
    }
    update(ref(db, `rooms/${code}`), roomUpdate);
    saveWinSummary({
      roomCode: code,
      totalSeconds: elapsed + penaltySeconds,
      mistakes: mistakeCount,
      winnerId,
      winnerName: session?.playerName ?? "Champion",
      winnerColor: session?.playerColor ?? "#7C3AED",
      punishment,
      leaderboard: firebasePlayers.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        progress: p.id === session?.playerId ? 100 : p.progress,
      })),
    });
    router.push(`/room/${code}/win`);
  }, [progressPercent, eliminated, router, code, elapsed, penaltySeconds, mistakeCount, session, firebasePlayers]);

  // Shake cleanup
  useEffect(() => {
    if (!shakeCell) return;
    const t = window.setTimeout(() => setShakeCell(null), 480);
    return () => window.clearTimeout(t);
  }, [shakeCell]);

  // Penalty toast cleanup
  useEffect(() => {
    if (penaltyToastId === 0) return;
    const t = window.setTimeout(() => setPenaltyToastId(0), 1200);
    return () => window.clearTimeout(t);
  }, [penaltyToastId]);

  const displayTimeSeconds = elapsed + penaltySeconds;
  const youName = session?.playerName ?? "You";
  const youColor = session?.playerColor ?? "#7C3AED";

  const progressRows: PlayerRow[] = useMemo(() => {
    if (firebasePlayers.length > 0) return firebasePlayers;
    return [{ id: "you", name: youName, color: youColor, progress: progressPercent, isYou: true }];
  }, [firebasePlayers, youName, youColor, progressPercent]);

  const isGiven = useCallback((r: number, c: number) => puzzle[r][c] !== 0, [puzzle]);

  const applyWrongPenalty = useCallback((r: number, c: number) => {
    setMistakeCount((m) => m + 1);
    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) setEliminated(true);
      return next;
    });
    setBarFlash(true);
    window.setTimeout(() => setBarFlash(false), 450);
    setPenaltyToastId((k) => k + 1);
    setShakeCell([r, c]);
  }, []);

  const handleCellClick = (r: number, c: number) => {
    if (isGiven(r, c)) return;
    setSelected([r, c]);
  };

  const handleNumber = (num: number) => {
    if (!selected) return;
    const [r, c] = selected;
    if (isGiven(r, c)) return;
    if (notesMode) {
      if (board[r][c] !== 0) return;
      setNotes((prev) => {
        const next = prev.map((row) => row.map((s) => new Set(s)));
        const set = next[r][c];
        if (set.has(num)) set.delete(num);
        else set.add(num);
        return next;
      });
      return;
    }
    const correct = num === solution[r][c];
    setBoard((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = num;
      return copy;
    });
    setMarks((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = correct ? "correct" : "wrong";
      return copy;
    });
    if (!correct) applyWrongPenalty(r, c);
  };

  const handleErase = () => {
    if (!selected) return;
    const [r, c] = selected;
    if (isGiven(r, c)) return;
    setBoard((prev) => { const copy = prev.map((row) => [...row]); copy[r][c] = 0; return copy; });
    setMarks((prev) => { const copy = prev.map((row) => [...row]); copy[r][c] = "neutral"; return copy; });
    setNotes((prev) => { const next = prev.map((row) => row.map((s) => new Set(s))); next[r][c].clear(); return next; });
  };

  const padColors = [
    "from-violet-500 to-fuchsia-500", "from-sky-500 to-blue-600",
    "from-emerald-500 to-teal-500", "from-amber-400 to-orange-500",
    "from-rose-500 to-orange-400", "from-indigo-500 to-purple-600",
    "from-cyan-400 to-blue-500", "from-lime-400 to-green-600",
    "from-pink-500 to-rose-500",
  ];

  if (eliminated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-party flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-8xl mb-4">💀</p>
          <h1 className="text-4xl font-black text-gray-900 mb-2">You&apos;re eliminated!</h1>
          <p className="text-lg font-bold text-gray-500 mb-8">You used all 3 lives 😢</p>
          <p className="text-base font-bold text-gray-400">Waiting for others to finish...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-party">
      <header className={`sticky top-0 z-40 border-b-2 border-violet-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur-md transition-colors sm:px-6 ${barFlash ? "bg-red-50" : ""}`}>
        <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-2">
          <Link href="/" className="shrink-0 text-sm font-black text-transparent sm:text-base bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#FBBF24] bg-clip-text" style={{ WebkitBackgroundClip: "text" }}>
            SUDOPARTY 🎉
          </Link>
          <div className="relative flex flex-1 flex-col items-center justify-center px-2">
            {penaltyToastId > 0 && (
              <span key={penaltyToastId} className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 text-sm font-black text-red-500" style={{ animation: "penaltyPop 1.15s ease-out forwards" }}>
                💔 -1 жизнь
              </span>
            )}
            <p className="font-mono text-2xl font-black tracking-widest text-[#7C3AED] sm:text-4xl">
              {formatTime(displayTimeSeconds)}
            </p>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 sm:text-xs">Time</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((i) => (
              <span key={i} className={`text-xl transition-all ${i <= lives ? "opacity-100" : "opacity-20 grayscale"}`}>
                ❤️
              </span>
            ))}
          </div>
          <Button
            variant={notesMode ? "primary" : "outline"}
            className={`shrink-0 !px-3 !py-2 !text-sm sm:!px-4 sm:!text-base ${notesMode ? "!bg-gradient-to-r !from-emerald-500 !to-teal-500 !text-white" : "!border-2 !border-gray-300 !bg-white !text-gray-800"}`}
            onClick={() => setNotesMode((n) => !n)}
          >
            Notes 📝 {notesMode ? "ON" : "OFF"}
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-3 py-4 sm:px-6">
        <div className="space-y-3">
          {progressRows.map((row) => (
            <div key={row.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex min-w-0 items-center gap-2 text-sm font-black text-gray-900 sm:w-44 sm:shrink-0">
                <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                <span className="truncate">{row.name}{row.isYou ? " (you)" : ""}</span>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-gray-200 shadow-inner">
                  <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${row.progress}%`, backgroundColor: row.color, boxShadow: `0 0 12px ${row.color}66` }} />
                </div>
                <span className="w-12 text-right text-sm font-black text-gray-700 tabular-nums">{row.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-3 pb-10 sm:px-6 lg:grid-cols-[1fr_min(280px,1fr)]">
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-[min(100vw-1.5rem,420px)]">
            <div className="grid aspect-square w-full grid-cols-9 overflow-hidden rounded-xl border-4 border-slate-800 bg-white shadow-xl" role="grid">
              {board.flatMap((row, r) =>
                row.map((value, c) => {
                  const fixed = isGiven(r, c);
                  const sel = selected?.[0] === r && selected?.[1] === c;
                  const mark = marks[r][c];
                  const shaking = shakeCell?.[0] === r && shakeCell?.[1] === c;
                  const thickRight = (c + 1) % 3 === 0 && c < 8;
                  const thickBottom = (r + 1) % 3 === 0 && r < 8;
                  let bg = "bg-white";
                  if (!fixed) {
                    if (mark === "correct") bg = "bg-emerald-100";
                    else if (mark === "wrong") bg = "bg-red-100";
                    else if (sel) bg = "bg-purple-100";
                  } else bg = "bg-slate-100";
                  const borderClass = ["border-slate-400", thickRight ? "border-r-[3px] border-r-slate-800" : "border-r", thickBottom ? "border-b-[3px] border-b-slate-800" : "border-b"].join(" ");
                  return (
                    <button type="button" key={`${r}-${c}`} disabled={fixed} onClick={() => handleCellClick(r, c)}
                      className={`relative flex aspect-square min-h-0 min-w-0 items-center justify-center font-black tabular-nums outline-none transition-colors disabled:cursor-default ${fixed ? "cursor-default text-slate-900" : "cursor-pointer hover:bg-violet-50"} ${borderClass} ${bg} ${sel && !fixed ? "z-10 ring-2 ring-inset ring-[#7C3AED]" : ""} text-[clamp(0.95rem,4.2vw,1.6rem)]`}
                      style={{ animation: !fixed && shaking ? "shake 0.45s ease-in-out" : undefined }}
                    >
                      {value !== 0 ? <span>{value}</span> : (
                        <span className="grid h-full w-full grid-cols-3 grid-rows-3 gap-px p-0.5 text-[clamp(0.45rem,2vw,0.65rem)] font-bold text-slate-500">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                            <span key={d} className="flex items-center justify-center">{notes[r][c].has(d) ? d : ""}</span>
                          ))}
                        </span>
                      )}
                    </button>
                  );
                }),
              )}
            </div>
          </div>
          <div className="mt-5 w-full max-w-[min(100vw-1.5rem,420px)]">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n, i) => (
                <button key={n} type="button" onClick={() => handleNumber(n)}
                  className={`rounded-2xl bg-gradient-to-br ${padColors[i]} px-2 py-4 text-2xl font-black text-white shadow-lg transition hover:scale-105 active:scale-95`}
                >{n}</button>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full !border-2 !border-rose-300 !bg-gradient-to-r !from-rose-100 !to-orange-100 !py-4 !text-lg !font-black !text-rose-800" onClick={handleErase}>
              Erase ✖️
            </Button>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="!rounded-3xl !border !border-gray-100 !bg-white !p-5 !shadow-xl">
            <h2 className="text-xl font-black text-gray-900">Party Sudoku ✨</h2>
            <p className="mt-2 text-sm font-bold leading-relaxed text-gray-600">
              Fill every cell correctly. You have <span className="text-red-500">3 lives ❤️</span>. First to 100% wins!
            </p>
            <p className="mt-4 rounded-2xl bg-violet-50 px-3 py-2 text-center text-lg font-black text-[#7C3AED]">
              Room <span className="font-mono tracking-widest">{code}</span>
            </p>
          </Card>
          <Card className="!rounded-3xl !border !border-amber-100 !bg-gradient-to-br !from-amber-50 !to-orange-50 !p-5 !text-center !shadow-lg">
            <p className="text-4xl">🎮</p>
            <p className="mt-2 font-black text-gray-800">Race your friends!</p>
            <p className="mt-1 text-sm font-bold text-gray-600">Progress syncs live via Firebase ⚡</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
