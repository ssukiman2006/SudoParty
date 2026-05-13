"use client";

import confetti from "canvas-confetti";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PUNISHMENTS } from "@/lib/constants";
import { readWinSummary, ROOM_SESSION_KEY, type RoomSession } from "@/lib/roomStorage";

const CONFETTI_COLORS = ["#7C3AED", "#EC4899", "#FBBF24", "#10B981", "#F97316"];

const floatingShapes = [
  { color: "bg-[#7C3AED]", opacity: "opacity-35", size: "h-44 w-44", position: "-top-20 -left-16", delay: "0s" },
  { color: "bg-[#EC4899]", opacity: "opacity-35", size: "h-52 w-52", position: "-top-10 right-0 md:right-10", delay: "0.4s" },
  { color: "bg-[#FBBF24]", opacity: "opacity-40", size: "h-40 w-40", position: "top-32 -left-8", delay: "0.9s" },
  { color: "bg-[#10B981]", opacity: "opacity-30", size: "h-48 w-48", position: "bottom-10 left-4 md:left-20", delay: "1.1s" },
  { color: "bg-[#F97316]", opacity: "opacity-35", size: "h-36 w-36", position: "bottom-24 right-6", delay: "0.2s" },
  { color: "bg-[#EC4899]", opacity: "opacity-25", size: "h-64 w-64", position: "top-1/3 -right-28 hidden md:block", delay: "1.6s" },
  { color: "bg-[#7C3AED]", opacity: "opacity-25", size: "h-32 w-32", position: "bottom-1/3 left-10", delay: "2s" },
  { color: "bg-[#FBBF24]", opacity: "opacity-30", size: "h-28 w-28", position: "top-24 left-1/3", delay: "2.4s" },
];

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function pickPunishment(excluding?: string): string {
  const pool = PUNISHMENTS.filter((p) => p !== excluding);
  return pool[Math.floor(Math.random() * pool.length)] ?? PUNISHMENTS[0];
}

type BoardRow = { id: string; name: string; pct: number; color: string; isWinner?: boolean };

function readRoomSession(code: string): RoomSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ROOM_SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as RoomSession;
    return session.roomCode?.toUpperCase() === code ? session : null;
  } catch {
    return null;
  }
}

export default function WinPage() {
  const router = useRouter();
  const params = useParams();
  const code = String(params.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

  const [session] = useState<RoomSession | null>(() => readRoomSession(code));
  const [savedSummary] = useState<ReturnType<typeof readWinSummary>>(() => readWinSummary());
  const [punishmentText, setPunishmentText] = useState<string>(
    () => savedSummary?.punishment ?? pickPunishment(),
  );
  const [punishPhase, setPunishPhase] = useState<"idle" | "out" | "in">("idle");
  const [typedLen, setTypedLen] = useState(0);

  const winnerName = savedSummary?.winnerName ?? session?.playerName ?? "Champion";
  const winnerColor = savedSummary?.winnerColor ?? session?.playerColor ?? "#7C3AED";
  const totalSeconds = savedSummary?.totalSeconds ?? 0;
  const mistakes = savedSummary?.mistakes ?? 0;
  const timeLabel = formatTime(totalSeconds);

  useEffect(() => {
    document.title = `🏆 ${winnerName} Wins! - Sudoparty`;
  }, [winnerName]);

  useEffect(() => {
    const fireSides = (scale = 1) => {
      confetti({ particleCount: Math.floor(170 * scale), spread: 62, startVelocity: 52, angle: 60, origin: { x: 0.1, y: 0.65 }, colors: CONFETTI_COLORS, ticks: 220 });
      confetti({ particleCount: Math.floor(170 * scale), spread: 62, startVelocity: 52, angle: 120, origin: { x: 0.9, y: 0.65 }, colors: CONFETTI_COLORS, ticks: 220 });
    };
    fireSides(1);
    const burst2 = window.setTimeout(() => fireSides(0.95), 1000);
    const burst3 = window.setTimeout(() => {
      confetti({ particleCount: 85, spread: 110, startVelocity: 38, origin: { x: 0.5, y: 0.55 }, colors: CONFETTI_COLORS, ticks: 200 });
    }, 2500);
    return () => { clearTimeout(burst2); clearTimeout(burst3); };
  }, []);

  useEffect(() => {
    const full = punishmentText;
    if (!full.length) return;
    let i = 0;
    let intervalId: number | null = null;
    const resetId = window.setTimeout(() => {
      setTypedLen(0);
      intervalId = window.setInterval(() => {
        i += 1;
        setTypedLen((n) => Math.min(n + 1, full.length));
        if (i >= full.length && intervalId !== null) window.clearInterval(intervalId);
      }, 28);
    }, 0);
    return () => {
      window.clearTimeout(resetId);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [punishmentText]);

  const leaderboard = useMemo<BoardRow[]>(() => {
    if (savedSummary?.leaderboard && savedSummary.leaderboard.length > 0) {
      const sorted = [...savedSummary.leaderboard].sort((a, b) => b.progress - a.progress);
      return sorted.map((p, idx) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        pct: p.progress,
        isWinner: savedSummary.winnerId ? p.id === savedSummary.winnerId : idx === 0,
      }));
    }
    return [{ id: "w", name: winnerName, pct: 100, color: winnerColor, isWinner: true }];
  }, [savedSummary, winnerName, winnerColor]);

  const subtitlePieces = useMemo(() => [
    { key: "a", text: "solved" },
    { key: "b", text: "it" },
    { key: "c", text: "in" },
    { key: "d", text: timeLabel },
    { key: "e", text: "⚡" },
    { key: "f", text: String(mistakes) },
    { key: "g", text: mistakes === 1 ? "mistake" : "mistakes" },
  ], [timeLabel, mistakes]);

  const handleReroll = useCallback(() => {
    if (punishPhase !== "idle") return;
    setPunishPhase("out");
    window.setTimeout(() => {
      setPunishmentText((prev) => pickPunishment(prev));
      setPunishPhase("in");
      window.setTimeout(() => setPunishPhase("idle"), 400);
    }, 320);
  }, [punishPhase]);

  const stars = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      left: `${5 + (i * 37) % 90}%`,
      duration: 4.5 + (i % 5) * 0.9,
      delay: (i % 7) * 0.35,
      size: 12 + (i % 4) * 5,
    })), []);

  const partyEmojis = ["🎉", "🎊", "🏆", "⭐", "🎮", "✨", "🎈", "💜"];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFAFA] font-party">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-70" style={{ background: "linear-gradient(120deg, rgba(124,58,237,0.2), rgba(236,72,153,0.22), rgba(251,191,36,0.2), rgba(16,185,129,0.18))", backgroundSize: "260% 260%", animation: "winRainbowMove 18s ease-in-out infinite" }} />

      {floatingShapes.map((shape, i) => (
        <div key={i} className={`pointer-events-none absolute z-0 rounded-full blur-[100px] ${shape.color} ${shape.opacity} ${shape.size} ${shape.position}`} style={{ animation: "float 5.2s ease-in-out infinite", animationDelay: shape.delay }} />
      ))}

      {stars.map((s) => (
        <div key={s.id} className="pointer-events-none absolute bottom-0 text-amber-300 opacity-90" style={{ left: s.left, fontSize: s.size, animation: `floatStar ${s.duration}s linear infinite`, animationDelay: `${s.delay}s` }} aria-hidden>⭐</div>
      ))}

      {partyEmojis.map((e, i) => (
        <div key={`${e}-${i}`} className="pointer-events-none absolute select-none text-2xl opacity-70 sm:text-3xl" style={{ left: `${(i * 83) % 92}%`, top: `${18 + (i % 5) * 12}%`, animation: `emojiFloat ${5 + (i % 4)}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }} aria-hidden>{e}</div>
      ))}

      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-10 sm:px-6">
        <p className="text-7xl leading-none sm:text-8xl" style={{ animation: "bounceIn 0.95s cubic-bezier(0.34, 1.56, 0.64, 1) forwards", transformOrigin: "center" }} aria-hidden>🏆</p>

        <h1 className="mt-6 text-center text-3xl font-black uppercase tracking-tight text-gray-900 sm:text-4xl" style={{ opacity: 0, animation: "winTitleSlide 0.75s ease-out forwards", animationDelay: "0.3s" }}>
          WE HAVE A WINNER!
        </h1>

        <div className="relative z-10 mt-4 px-2 text-center">
          <div className="relative inline-block overflow-visible" style={{ opacity: 0, animation: "winnerNameIn 1s cubic-bezier(0.34, 1.4, 0.64, 1) forwards", animationDelay: "0.5s" }}>
            <span className="relative z-20 block bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#FBBF24] bg-clip-text text-6xl font-black text-transparent md:text-8xl" style={{ backgroundSize: "200% auto", animation: "gradientFlow 6s ease-in-out infinite", WebkitBackgroundClip: "text" }}>
              {winnerName}
            </span>
          </div>
        </div>

        <p className="mt-6 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-lg font-black text-gray-700 sm:text-xl">
          {subtitlePieces.map((p, i) => (
            <span key={p.key} className="inline-block" style={{ opacity: 0, animation: "winWord 0.45s ease-out forwards", animationDelay: `${0.8 + i * 0.12}s` }}>
              {p.text}
            </span>
          ))}
        </p>

        <div className="mt-10 w-full max-w-xl" style={{ opacity: 0, animation: "winCardRise 0.85s ease-out forwards", animationDelay: "1s" }}>
          <Card className="w-full !rounded-3xl !border !border-amber-100 !bg-white/95 !p-5 !shadow-2xl">
            <h2 className="text-center text-xl font-black text-gray-900">Leaderboard 🏅</h2>
            <ul className="mt-5 space-y-3">
              {leaderboard.map((row, idx) => {
                const delays = ["1.2s", "1.4s", "1.6s", "1.8s"];
                const rowDelay = delays[idx] ?? "1.8s";
                return (
                  <li key={row.id} className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-3 shadow-sm ${row.isWinner ? "border-amber-400" : "border-gray-100"}`} style={{ opacity: 0, animation: `winRowSlide 0.55s ease-out ${rowDelay} forwards` }}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg font-black text-gray-700">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                    </span>
                    <span className="h-8 w-8 shrink-0 rounded-full border-2 border-white shadow" style={{ backgroundColor: row.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-gray-900">{row.name}</p>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                      </div>
                    </div>
                    <span className="text-sm font-black tabular-nums text-gray-700">{row.pct}%</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div className="mt-6 w-full max-w-xl" style={{ animation: "punishmentShake 0.65s ease-out 1.9s both" }}>
          <Card className="w-full !rounded-3xl !border !border-fuchsia-200 !bg-gradient-to-br !from-fuchsia-50 !to-amber-50 !p-5 !shadow-xl">
            <div className="flex items-start gap-3">
              <span className="text-3xl transition-transform duration-700 hover:rotate-[360deg]" aria-hidden>😈</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black uppercase tracking-widest text-fuchsia-800">Party Punishment for last place!</p>
                <div className="relative mt-2 min-h-[3rem] overflow-hidden rounded-xl border border-fuchsia-200/80 bg-white/80 px-3 py-2 text-base font-bold text-gray-800">
                  <p className="leading-snug" style={punishPhase === "out" ? { animation: "punishOut 0.32s ease-in forwards" } : punishPhase === "in" ? { animation: "punishIn 0.38s ease-out forwards" } : undefined}>
                    {punishmentText.slice(0, typedLen)}
                    {typedLen < punishmentText.length ? <span className="animate-pulse font-black text-fuchsia-500">|</span> : null}
                  </p>
                </div>
                <Button variant="secondary" className="mt-4 !w-full !rounded-2xl !bg-gradient-to-r !from-emerald-400 !to-teal-500 !font-black !text-white hover:!scale-105 sm:!w-auto" onClick={handleReroll} disabled={punishPhase !== "idle"}>
                  Re-roll 🎲
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center" style={{ opacity: 0, animation: "bottomBounce 0.85s cubic-bezier(0.34, 1.52, 0.64, 1) forwards", animationDelay: "2.2s" }}>
          <Button variant="primary" className="w-full !bg-gradient-to-r !from-[#7C3AED] !to-[#EC4899] !py-4 !font-black !text-white hover:!scale-105" onClick={() => router.push("/room/create")}>
            Play Again 🔄
          </Button>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full !border-2 !border-violet-300 !bg-white !py-4 !font-black !text-violet-800 hover:!scale-110">
              Back Home 🏠
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
          Room <span className="font-mono">{code}</span>
        </p>
      </main>
    </div>
  );
}
