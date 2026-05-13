"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { PartyShell } from "@/components/room/PartyShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DIFFICULTIES, ROOM_COLOR_PICKER } from "@/lib/constants";
import { createRoom } from "@/lib/roomService";
import { generatePlayerId, generateRoomCode, saveRoomSession } from "@/lib/roomStorage";
import type { Difficulty } from "@/lib/types";

const ctaClass =
  "sticky bottom-3 z-20 w-full !bg-gradient-to-r !from-[#7C3AED] !to-[#EC4899] !py-4 !px-8 !text-lg !font-black !text-white !shadow-xl hover:!scale-[1.03] hover:!shadow-[0_14px_44px_-8px_rgba(124,58,237,0.5)] active:!scale-100";

const difficultyIdle =
  "border-2 border-gray-200 bg-white text-gray-700 hover:border-[#c4b5fd]/80 hover:shadow-md active:scale-95";

export default function CreateRoomPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const form = new FormData(event.currentTarget);
    const trimmed = String(form.get("playerName") ?? "").trim();
    const color = String(form.get("playerColor") ?? ROOM_COLOR_PICKER[0].hex);
    const difficulty = String(form.get("difficulty") ?? "Easy") as Difficulty;
    if (!trimmed) return;

    const roomCode = generateRoomCode();
    const playerId = generatePlayerId();
    setBusy(true);
    setError(null);
    try {
      await createRoom(
        roomCode,
        { id: playerId, name: trimmed, color, isReady: true },
        difficulty,
      );
      saveRoomSession({
        roomCode,
        playerId,
        playerName: trimmed,
        playerColor: color,
        difficulty,
        isHost: true,
      });
      window.location.assign(`/room/${roomCode}/lobby`);
    } catch (e) {
      setError("Could not create room. Check your connection and try again.");
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PartyShell title="Create Room">
      <Card className="!rounded-3xl !border !border-gray-100 !bg-white/95 !p-6 !shadow-xl backdrop-blur-sm transition-all duration-500 hover:!shadow-2xl sm:!p-8">
        <form className="space-y-8" onSubmit={handleCreate}>
          <div className="space-y-2 transition-all duration-300">
            <label className="block text-left text-lg font-black text-gray-800" htmlFor="nickname">
              Your Name 👤
            </label>
            <input
              id="nickname"
              name="playerName"
              type="text"
              required
              maxLength={24}
              placeholder="Enter your nickname..."
              autoComplete="nickname"
              className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-lg font-bold text-gray-900 outline-none ring-0 transition focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/15"
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

          <div className="space-y-3">
            <p className="text-left text-lg font-black text-gray-800">Difficulty 🎯</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DIFFICULTIES.map((d) => (
                <label
                  key={d}
                  className="cursor-pointer"
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={d}
                    defaultChecked={d === "Easy"}
                    className="peer sr-only"
                  />
                  <span className={`block rounded-2xl px-2 py-3 text-center text-sm font-black transition-all duration-200 peer-checked:scale-[1.02] peer-checked:border-[#7C3AED] peer-checked:bg-[#7C3AED] peer-checked:text-white peer-checked:shadow-md peer-checked:shadow-[#7C3AED]/30 sm:text-base ${difficultyIdle}`}>
                    {d}
                    {d === "Chaos" ? " ✨" : ""}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error ? (
            <p className="rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-bold text-red-700">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            disabled={busy}
            className={`${ctaClass} disabled:!cursor-not-allowed disabled:!opacity-50 disabled:hover:!scale-100`}
          >
            {busy ? "Creating…" : "Create Room 🎮"}
          </Button>
        </form>
      </Card>
    </PartyShell>
  );
}
