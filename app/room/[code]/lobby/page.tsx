"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { PartyShell } from "@/components/room/PartyShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { FirebaseRoom } from "@/lib/roomService";
import { ROOM_SESSION_KEY, type RoomSession } from "@/lib/roomStorage";

type LobbyPlayer = {
  id: string;
  name: string;
  color: string;
  isReady: boolean;
  isHost?: boolean;
};

const difficultyBadge: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Medium: "bg-amber-100 text-amber-700 border-amber-300",
  Hard: "bg-orange-100 text-orange-700 border-orange-300",
  Chaos: "bg-rose-100 text-rose-700 border-rose-300",
};

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

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const code = String(params.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

  const [session] = useState<RoomSession | null>(() => readRoomSession(code));
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [punishmentMode, setPunishmentMode] = useState<"Funny" | "Evil">("Funny");
  const [showProModal, setShowProModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");

  // Listen to Firebase room
  useEffect(() => {
    if (!code) return;
    const roomRef = ref(db, `rooms/${code}`);
    const unsub = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as FirebaseRoom | null;
      if (!data) return;

      // Set difficulty
      if (data.difficulty) setSelectedDifficulty(data.difficulty);

      // Set players from Firebase
      if (data.players) {
        const playersArray: LobbyPlayer[] = Object.entries(data.players).map(([id, p]) => ({
          id,
          name: p.name,
          color: p.color,
          isReady: p.isReady ?? false,
          isHost: p.isHost ?? false,
        }));
        setPlayers(playersArray);
      }

      // If game started → navigate to game
      if (data.status === "playing") {
        router.push(`/room/${code}/game`);
      }
    });
    return () => unsub();
  }, [code, router]);

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  }

  async function handleStartGame() {
    await update(ref(db, `rooms/${code}`), {
      status: "playing",
      startedAt: Date.now(),
    });
    window.location.assign(`/room/${code}/game`);
  }

  return (
    <PartyShell
      title="Room Lobby"
      headerRight={
        <Link
          href="/upgrade"
          className="rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-2 text-xs font-black text-amber-900 shadow-md transition hover:scale-110 hover:shadow-lg active:scale-95 sm:text-sm"
        >
          ⚡ Pro
        </Link>
      }
    >
      <div className="space-y-5">
        <Card className="!rounded-3xl !border !border-gray-100 !bg-white !p-5 !shadow-xl">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-gray-500">Room Code</p>
              <p className="font-mono text-4xl font-black tracking-[0.2em] text-[#7C3AED] sm:text-5xl">
                {code || "------"}
              </p>
            </div>
            <p className="rounded-full bg-purple-100 px-3 py-1 text-sm font-black text-purple-700">
              Waiting Room 🎉
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="!rounded-3xl !border !border-gray-100 !bg-white !p-5 !shadow-xl">
            <h2 className="mb-4 text-2xl font-black text-gray-900">
              Players 👥 ({players.length})
            </h2>
            <div className="space-y-3">
              {players.length === 0 && (
                <p className="text-gray-400 font-bold">Waiting for players...</p>
              )}
              {players.map((player) => (
                <div
                  key={player.id}
                  className="rounded-2xl border-2 bg-white p-3 shadow-sm"
                  style={{ borderColor: player.color }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-black text-white"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-gray-900">{player.name}</p>
                        {player.isHost && (
                          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-black text-yellow-700">
                            HOST 👑
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-bold ${player.isReady ? "text-emerald-600" : "text-gray-500"}`}>
                        {player.isReady ? "Ready ✅" : "Waiting... ⏳"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="!rounded-3xl !border !border-gray-100 !bg-white !p-5 !shadow-xl">
            <h2 className="mb-4 text-2xl font-black text-gray-900">Game Settings ⚙️</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-black uppercase tracking-wide text-gray-500">Difficulty</p>
                <span className={`rounded-full border px-3 py-1 text-sm font-black ${difficultyBadge[selectedDifficulty] ?? "bg-gray-100 text-gray-700 border-gray-300"}`}>
                  {selectedDifficulty}
                </span>
              </div>
              <div>
                <p className="mb-2 text-sm font-black uppercase tracking-wide text-gray-500">Punishment Mode</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPunishmentMode("Funny")}
                    className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                      punishmentMode === "Funny"
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    😂 Funny
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPunishmentMode("Funny");
                      setShowProModal(true);
                    }}
                    aria-haspopup="dialog"
                    className="rounded-xl border-2 border-red-200 bg-red-100 px-4 py-2 text-sm font-black text-red-700 transition hover:scale-105 hover:border-red-300 hover:bg-red-200 active:scale-95"
                  >
                    😈 Evil 🔒
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-black uppercase tracking-wide text-gray-500">Invite Code</p>
                <div className="flex items-center gap-2">
                  <p className="rounded-xl bg-violet-50 px-3 py-2 font-mono text-2xl font-black tracking-[0.12em] text-[#7C3AED]">
                    {code}
                  </p>
                  <Button
                    variant="outline"
                    className="!border-2 !border-violet-300 !bg-white !px-4 !py-2 !text-violet-700 hover:!scale-105"
                    onClick={handleCopyCode}
                  >
                    Copy Code
                  </Button>
                </div>
                {copied && <p className="mt-2 text-sm font-bold text-emerald-600">Copied! ✅</p>}
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-3 pb-2 pt-1">
          {session?.isHost ? (
            <Button
              className="w-full max w-md !bg-gradient-to-r !from-[#7C3AED] !to-[#EC4899] !py-4 !text-xl !font-black !text-white hover:!scale-105"
              onClick={handleStartGame}
            >
              Start Game 🚀
            </Button>
          ) : (
            <p className="text-lg font-bold text-gray-500">Waiting for host to start... ⏳</p>
          )}
          <button
  type="button"
  className="text-sm font-bold text-gray-500 underline underline-offset-2"
  onClick={async () => {
    if (session?.playerId) {
      const { ref: dbRef, remove } = await import("firebase/database");
      const { db } = await import("@/lib/firebase");
      await remove(dbRef(db, `rooms/${code}/players/${session.playerId}`));
    }
    router.push("/");
  }}
>
  Leave Room
</button>
        </div>
      </div>
      {showProModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="evil-pro-title"
        >
          <div className="w-full max-w-md rounded-3xl border-2 border-rose-200 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 text-3xl shadow-lg shadow-rose-500/25">
              😈
            </div>
            <p id="evil-pro-title" className="mt-4 text-3xl font-black text-gray-900">
              Upgrade to Pro
            </p>
            <p className="mt-2 text-base font-bold leading-relaxed text-gray-600">
              Evil punishment mode is locked. Upgrade to Pro to unlock brutal punishments and extra party features.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 !border-2 !border-gray-300 !bg-white !py-3 !font-black !text-gray-700"
                onClick={() => setShowProModal(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 !bg-gradient-to-r !from-[#7C3AED] !to-[#EC4899] !py-3 !font-black !text-white"
                onClick={() => router.push("/upgrade")}
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      )}
    </PartyShell>
  );
}
