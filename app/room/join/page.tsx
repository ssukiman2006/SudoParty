"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { PartyShell } from "@/components/room/PartyShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ROOM_COLOR_PICKER } from "@/lib/constants";
import { joinRoom } from "@/lib/roomService";
import { generatePlayerId, saveRoomSession } from "@/lib/roomStorage";

const joinCtaClass =
  "sticky bottom-3 z-20 w-full !bg-gradient-to-r !from-[#FBBF24] !to-[#F97316] !py-4 !px-8 !text-lg !font-black !text-white !shadow-xl hover:!scale-[1.03] hover:!shadow-[0_14px_44px_-8px_rgba(251,191,36,0.55)] active:!scale-100";

function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

export default function JoinRoomPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const form = new FormData(event.currentTarget);
    const roomCode = normalizeCode(String(form.get("roomCode") ?? ""));
    const trimmed = String(form.get("playerName") ?? "").trim();
    const color = String(form.get("playerColor") ?? ROOM_COLOR_PICKER[0].hex);
    if (roomCode.length !== 6 || !trimmed) {
      setError("Enter the 6-character room code and your name.");
      return;
    }

    const playerId = generatePlayerId();
    setBusy(true);
    setError(null);
    try {
      await joinRoom(roomCode, { id: playerId, name: trimmed, color });
      saveRoomSession({
        roomCode,
        playerId,
        playerName: trimmed,
        playerColor: color,
        isHost: false,
      });
      window.location.assign(`/room/${roomCode}/lobby`);
    } catch (e) {
      const msg =
        e instanceof Error && e.message === "ROOM_NOT_FOUND"
          ? "Room not found. Check the code and try again."
          : "Could not join room. Check your connection and try again.";
      setError(msg);
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PartyShell title="Join Room">
      <Card className="!rounded-3xl !border !border-gray-100 !bg-white/95 !p-6 !shadow-xl backdrop-blur-sm transition-all duration-500 hover:!shadow-2xl sm:!p-8">
        <form className="space-y-8" onSubmit={handleJoin}>
          <div className="space-y-3">
            <label className="block text-left text-lg font-black text-gray-800" htmlFor="room-code">
              Room Code 🔑
            </label>
            <input
              id="room-code"
              name="roomCode"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              required
              maxLength={8}
              placeholder="Enter 6-digit code..."
              className="w-full rounded-2xl border-2 border-gray-200 bg-white py-4 text-center font-mono text-3xl font-black tracking-[0.35em] text-gray-900 outline-none transition placeholder:text-gray-400 placeholder:tracking-normal focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/15 sm:text-4xl"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-left text-lg font-black text-gray-800" htmlFor="join-nickname">
              Your Name 👤
            </label>
            <input
              id="join-nickname"
              name="playerName"
              type="text"
              required
              maxLength={24}
              placeholder="Enter your nickname..."
              autoComplete="nickname"
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-lg font-bold text-gray-900 outline-none transition focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/15"
            />
          </div>

          <div className="space-y-3">
            <p className="text-left text-lg font-black text-gray-800">Pick your color 🎨</p>
            <div className="flex flex-wrap justify-center gap-3 sm:justify-between">
              {ROOM_COLOR_PICKER.map((c) => {
                return (
                  <label
                    key={c.hex}
                    title={c.name}
                    className="cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="playerColor"
                      value={c.hex}
                      defaultChecked={c.hex === ROOM_COLOR_PICKER[0].hex}
                      className="peer sr-only"
                    />
                    <span
                      className="block h-12 w-12 rounded-full border-2 border-black/10 shadow-md transition-all duration-200 peer-checked:scale-110 peer-checked:ring-4 peer-checked:ring-[#7C3AED] peer-checked:ring-offset-2 peer-checked:ring-offset-white"
                      style={{ backgroundColor: c.hex }}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {error ? (
            <p className="rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-bold text-red-700">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="secondary"
            disabled={busy}
            className={`${joinCtaClass} disabled:!cursor-not-allowed disabled:!opacity-50 disabled:hover:!scale-100`}
          >
            {busy ? "Joining…" : "Join Room 🚪"}
          </Button>
        </form>
      </Card>
    </PartyShell>
  );
}
