"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

const FALLING_NUMBERS = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9];
const COLORS = ["#7C3AED","#EC4899","#FBBF24","#10B981","#F97316","#3B82F6","#EF4444","#8B5CF6"];
const PARTY_TILES = [
  { value: 7, className: "left-[6%] top-[18%]", rotate: "-14deg", color: "#7C3AED", delay: "0s" },
  { value: 2, className: "right-[8%] top-[16%]", rotate: "12deg", color: "#EC4899", delay: "0.4s" },
  { value: 9, className: "left-[10%] bottom-[22%]", rotate: "10deg", color: "#10B981", delay: "0.8s" },
  { value: 4, className: "right-[11%] bottom-[20%]", rotate: "-10deg", color: "#F97316", delay: "1.2s" },
] as const;

const MINI_BOARDS = [
  {
    className: "left-[3%] top-[36%] hidden lg:grid",
    rotate: "-8deg",
    cells: [5, 0, 3, 0, 8, 0, 2, 0, 9],
    accent: "#7C3AED",
  },
  {
    className: "right-[3%] top-[40%] hidden lg:grid",
    rotate: "7deg",
    cells: [0, 6, 0, 1, 0, 4, 0, 8, 0],
    accent: "#EC4899",
  },
] as const;

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-white px-6 py-14 text-center font-party">

      {/* Bright gradient background */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        background: "linear-gradient(135deg, #FFF0FB 0%, #F0F4FF 25%, #FFFBF0 50%, #F0FFF8 75%, #FFF0FB 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 8s ease infinite",
      }} />

      {/* Color streaks */}
      <div className="pointer-events-none absolute left-[-8%] top-10 h-10 w-[42rem] -rotate-12 bg-[#7C3AED]/15" />
      <div className="pointer-events-none absolute right-[-10%] top-24 h-12 w-[36rem] rotate-12 bg-[#EC4899]/15" />
      <div className="pointer-events-none absolute bottom-20 left-[-12%] h-14 w-[38rem] rotate-6 bg-[#FBBF24]/25" />
      <div className="pointer-events-none absolute bottom-36 right-[-12%] h-10 w-[34rem] -rotate-6 bg-[#10B981]/18" />

      {/* Falling numbers */}
      {FALLING_NUMBERS.map((num, i) => (
        <div
          key={i}
          className="pointer-events-none absolute z-0 select-none font-black"
          style={{
            left: `${(i * 97) % 100}%`,
            top: `-${20 + (i * 13) % 30}px`,
            fontSize: `${16 + (i % 4) * 8}px`,
            color: COLORS[i % COLORS.length],
            opacity: 0.15 + (i % 3) * 0.08,
            animation: `fallDown ${4 + (i % 5)}s linear infinite`,
            animationDelay: `${(i * 0.3) % 5}s`,
          }}
        >
          {num}
        </div>
      ))}

      {/* Sudoku board accents */}
      {MINI_BOARDS.map((board, boardIndex) => (
        <div
          key={boardIndex}
          className={`pointer-events-none absolute z-0 grid h-28 w-28 grid-cols-3 overflow-hidden border-4 bg-white/80 shadow-xl ${board.className}`}
          style={{
            "--board-rotate": board.rotate,
            borderColor: board.accent,
            animation: "boardFloat 5s ease-in-out infinite",
          } as CSSProperties}
        >
          {board.cells.map((cell, i) => (
            <div
              key={i}
              className="flex items-center justify-center border border-gray-200 text-lg font-black"
              style={{ color: cell ? board.accent : "#CBD5E1", backgroundColor: cell ? "#FFFFFF" : `${board.accent}14` }}
            >
              {cell || ""}
            </div>
          ))}
        </div>
      ))}

      {PARTY_TILES.map((tile) => (
        <div
          key={`${tile.value}-${tile.className}`}
          className={`pointer-events-none absolute z-0 hidden h-16 w-16 items-center justify-center border-4 bg-white text-3xl font-black shadow-xl sm:flex ${tile.className}`}
          style={{
            borderColor: tile.color,
            color: tile.color,
            "--tile-rotate": tile.rotate,
            animation: "tilePop 3.8s ease-in-out infinite",
            animationDelay: tile.delay,
          } as CSSProperties}
        >
          {tile.value}
        </div>
      ))}

      {/* Floating emoji decorations */}
      {["🎮","🎉","⭐","🏆","✨","🎊","💜","🎯"].map((emoji, i) => (
        <div
          key={emoji}
          className="pointer-events-none absolute z-0 select-none text-2xl"
          style={{
            left: `${5 + (i * 13) % 90}%`,
            top: `${10 + (i * 17) % 80}%`,
            animation: `float ${4 + i % 3}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0.4,
          }}
        >
          {emoji}
        </div>
      ))}

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8">

        {/* Logo */}
        <div className="relative">
          <div className="absolute -left-8 top-1/2 h-3 w-20 -translate-y-1/2 -rotate-12 bg-[#10B981]" />
          <div className="absolute -right-8 top-1/2 h-3 w-20 -translate-y-1/2 rotate-12 bg-[#FBBF24]" />
          <div className="absolute -top-5 left-8 h-4 w-4 rotate-12 bg-[#EC4899]" />
          <div className="absolute -bottom-5 right-10 h-5 w-5 -rotate-12 bg-[#7C3AED]" />
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#FBBF24] opacity-20 blur-xl" />
          <h1
            className="relative bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#FBBF24] bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl md:text-9xl"
            style={{ animation: "wiggle 2s ease-in-out infinite" }}
          >
            SUDOPARTY 🎉
          </h1>
          <div className="absolute -bottom-7 left-1/2 flex -translate-x-1/2 gap-2">
            {[1, 2, 3, 4, 5].map((step, i) => (
              <span
                key={step}
                className="h-2 w-10 rounded-full"
                style={{
                  backgroundColor: COLORS[i],
                  animation: "meterDash 1.3s ease-in-out infinite",
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 opacity-80" />
          <p className="relative max-w-2xl rounded-2xl px-6 py-3 text-xl font-black text-gray-700 md:text-2xl">
            The most <span className="text-[#EC4899]">chaotic</span> way to play{" "}
            <span className="text-[#7C3AED]">Sudoku</span> with{" "}
            <span className="text-[#F97316]">friends</span> 🔥
          </p>
        </div>

        {/* Buttons */}
        <div className="flex w-full max-w-lg flex-col gap-4 sm:flex-row">
          <Link
            href="/room/create"
            className="group relative flex-1 overflow-hidden rounded-2xl px-8 py-5 text-xl font-black text-white shadow-2xl transition-all hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(124,58,237,0.6)] active:scale-100"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
          >
            <div className="absolute inset-0 bg-white opacity-0 transition group-hover:opacity-10" />
            <span className="relative">🎮 Create Room</span>
          </Link>
          <Link
            href="/room/join"
            className="group relative flex-1 overflow-hidden rounded-2xl px-8 py-5 text-xl font-black text-white shadow-2xl transition-all hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(251,191,36,0.6)] active:scale-100"
            style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)" }}
          >
            <div className="absolute inset-0 bg-white opacity-0 transition group-hover:opacity-10" />
            <span className="relative">🚪 Join Room</span>
          </Link>
        </div>

        <p className="text-sm font-bold text-gray-400">
          Free to play • Up to 5 players • No login needed
        </p>

        {/* Stats */}
        <div className="grid w-full max-w-2xl grid-cols-3 gap-3">
          {[
            { emoji: "🎮", num: "2,431", label: "games", color: "#7C3AED" },
            { emoji: "👥", num: "8,912", label: "players", color: "#EC4899" },
            { emoji: "🏆", num: "1,204", label: "winners", color: "#FBBF24" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-lg transition hover:scale-105"
              style={{ borderTopColor: stat.color, borderTopWidth: 4 }}
            >
              <p className="text-2xl">{stat.emoji}</p>
              <p className="text-xl font-black" style={{ color: stat.color }}>{stat.num}</p>
              <p className="text-xs font-bold text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* How to play */}
        <div className="grid w-full max-w-2xl grid-cols-3 gap-3">
          {[
            { step: "1", text: "Create or join a room", emoji: "🏠", color: "#7C3AED" },
            { step: "2", text: "Solve Sudoku faster", emoji: "⚡", color: "#EC4899" },
            { step: "3", text: "Loser gets punished!", emoji: "😈", color: "#F97316" },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl p-4 text-center shadow-md transition hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${item.color}15, ${item.color}30)`,
                border: `2px solid ${item.color}40`,
              }}
            >
              <p className="text-3xl">{item.emoji}</p>
              <p className="mt-1 text-xs font-black text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>

        
          <a
          href="/upgrade"
          className="inline-block rounded-full border-2 border-[#7C3AED] px-6 py-2 text-sm font-black text-[#7C3AED] transition hover:bg-[#7C3AED] hover:text-white hover:scale-105"
        >
          ⚡ Upgrade to Pro
        </a>

      </section>

      <style>{`
        @keyframes fallDown {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.15; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-1deg) scale(1); }
          25% { transform: rotate(1deg) scale(1.02); }
          50% { transform: rotate(-0.5deg) scale(1); }
          75% { transform: rotate(0.5deg) scale(1.01); }
        }
        @keyframes tilePop {
          0%, 100% { transform: translateY(0) scale(1) rotate(var(--tile-rotate)); }
          45% { transform: translateY(-10px) scale(1.08) rotate(var(--tile-rotate)); }
        }
        @keyframes boardFloat {
          0%, 100% { transform: translateY(0) rotate(var(--board-rotate)); }
          50% { transform: translateY(-8px) rotate(var(--board-rotate)); }
        }
        @keyframes meterDash {
          0%, 100% { transform: scaleX(0.65); opacity: 0.55; }
          50% { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

    </main>
  );
}
