"use client";

import confetti from "canvas-confetti";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const PARTY_COLORS = ["#7C3AED", "#EC4899", "#FBBF24"];

const floats = [
  { color: "bg-[#7C3AED]", opacity: "opacity-35", size: "h-48 w-48", pos: "-top-16 -left-20", delay: "0s" },
  { color: "bg-[#EC4899]", opacity: "opacity-35", size: "h-56 w-56", pos: "-top-8 right-0 md:right-8", delay: "0.5s" },
  { color: "bg-[#FBBF24]", opacity: "opacity-35", size: "h-44 w-44", pos: "top-1/4 -left-12", delay: "1s" },
  { color: "bg-[#7C3AED]", opacity: "opacity-25", size: "h-64 w-64", pos: "bottom-20 left-1/4", delay: "0.8s" },
  { color: "bg-[#EC4899]", opacity: "opacity-30", size: "h-40 w-40", pos: "-bottom-8 right-6", delay: "1.4s" },
  {
    color: "bg-[#FBBF24]",
    opacity: "opacity-28",
    size: "h-52 w-52",
    pos: "top-1/2 -right-24 hidden lg:block",
    delay: "2s",
  },
];

const WHY_PRO = [
  { emoji: "🎮", title: "More Players", desc: "Invite up to 20 friends.", border: "hover:border-fuchsia-400" },
  { emoji: "😈", title: "Evil Mode", desc: "Brutal punishments for losers.", border: "hover:border-rose-500" },
  { emoji: "🏆", title: "Ranked Mode", desc: "Climb the global leaderboard.", border: "hover:border-amber-400" },
  { emoji: "🎨", title: "Custom Themes", desc: "Make your room unique.", border: "hover:border-violet-500" },
];

const TESTIMONIALS = [
  { quote: 'Evil mode made my friend cry laughing 😂', author: "Aigerim K." },
  { quote: "20 players chaos is absolutely unhinged 🔥", author: "Daniyal M." },
  { quote: "Best $4.99 I ever spent on Sudoku", author: "Sara T." },
];

const PRO_FEATURES = [
  "Up to 20 players",
  "Custom punishments",
  "😈 Evil punishment mode",
  "Chaos difficulty",
  "Animated themes",
  "Premium avatars (20+)",
  "Ranked mode 🏆",
  "Tournaments",
  "Custom room themes",
  "Priority support",
];

const SUBTITLE_FULL = "Unlock the full Sudoparty experience";

function celebrationConfetti() {
  const colors = [...PARTY_COLORS, "#10B981", "#F97316"];
  confetti({
    particleCount: 140,
    spread: 72,
    startVelocity: 50,
    origin: { x: 0.15, y: 0.75 },
    colors,
    ticks: 200,
  });
  confetti({
    particleCount: 140,
    spread: 72,
    startVelocity: 50,
    origin: { x: 0.85, y: 0.75 },
    colors,
    ticks: 200,
  });
  confetti({
    particleCount: 100,
    spread: 105,
    origin: { x: 0.5, y: 0.52 },
    colors,
    ticks: 190,
  });
}

export default function UpgradePage() {
  const [showModal, setShowModal] = useState(false);
  const [subLen, setSubLen] = useState(0);

  useEffect(() => {
    if (subLen >= SUBTITLE_FULL.length) return;
    const id = window.setTimeout(() => setSubLen((n) => n + 1), 40);
    return () => window.clearTimeout(id);
  }, [subLen]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FAFAFA] font-party">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-50"
        style={{
          background:
            "linear-gradient(125deg, rgba(124,58,237,0.14), rgba(236,72,153,0.12), rgba(251,191,36,0.14))",
          backgroundSize: "220% 220%",
          animation: "gradientFlow 16s ease-in-out infinite",
        }}
      />

      {floats.map((f, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute z-0 rounded-full blur-[96px] ${f.color} ${f.opacity} ${f.size} ${f.pos}`}
          style={{
            animation: "float 5.5s ease-in-out infinite",
            animationDelay: f.delay,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        <header
          style={{
            opacity: 0,
            animation: "upgradeSlideDown 0.65s ease-out forwards",
            animationDelay: "0.1s",
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white text-xl shadow-md transition hover:scale-110 hover:border-[#7C3AED]/45 hover:shadow-xl active:scale-95"
              aria-label="Back home"
            >
              ←
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-[2.85rem]">
              Upgrade to Pro{" "}
              <span className="text-transparent bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text">⚡</span>
            </h1>
          </div>

          <p className="mt-4 max-w-3xl min-h-[1.4em] bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F97316] bg-clip-text text-lg font-black text-transparent sm:text-xl lg:text-2xl">
            {SUBTITLE_FULL.slice(0, subLen)}
            {subLen < SUBTITLE_FULL.length ? (
              <span className="inline-block text-violet-600 animate-pulse">▍</span>
            ) : null}
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:items-start">
          {/* Free */}
          <div
            style={{
              opacity: 0,
              animation: "upgradeSlideLeft 0.7s ease-out forwards",
              animationDelay: "0.3s",
            }}
          >
            <Card className="group h-full !rounded-3xl border-2 border-gray-200 !bg-white !p-7 !shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl lg:!p-8">
              <span className="inline-block rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-gray-600">
                Current Plan
              </span>
              <p className="mt-5 text-[2.85rem] font-black leading-none text-gray-900 sm:text-6xl">$0</p>
              <p className="mt-3 text-base font-bold text-gray-600">Forever free. Forever chaotic.</p>
              <ul className="mt-8 space-y-3.5 text-[15px] font-bold leading-relaxed text-gray-800 sm:text-base">
                {[
                  "Up to 5 players",
                  "Basic punishments",
                  "Easy/Medium/Hard difficulty",
                  "Standard avatars",
                  "3 room themes",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 transition hover:translate-x-1.5 hover:text-gray-950">
                    <span aria-hidden className="shrink-0 text-emerald-500">
                      ✅
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Pro */}
          <div
            className="relative lg:scale-105 lg:origin-top"
            style={{
              opacity: 0,
              animation: "upgradeSlideRight 0.75s ease-out forwards",
              animationDelay: "0.5s",
            }}
          >
            <div className="relative rounded-[1.55rem] p-[3px]" style={{ animation: "proCardGlowPulse 2.6s ease-in-out infinite" }}>
              <Card className="relative overflow-hidden !rounded-[1.4rem] !border-0 !bg-gradient-to-br !from-[#7C3AED] !via-[#9333EA] !to-[#EC4899] !p-7 !shadow-2xl !text-white lg:!p-9">
                <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-44 w-44 rounded-full bg-pink-300/25 blur-3xl" />

                <span
                  className="relative inline-block rounded-full bg-amber-300 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-purple-950"
                  style={{ animation: "proBadgePulse 2.2s ease-in-out infinite" }}
                >
                  MOST POPULAR 🔥
                </span>

                <p className="relative mt-5 text-[2.4rem] font-black leading-none sm:text-[2.75rem]">$4.99/month</p>
                <p className="relative mt-2 text-sm font-bold text-white/90">or $39.99/year (save 33%)</p>

                <ul className="relative mt-8 max-h-none space-y-3 text-[15px] font-bold leading-relaxed sm:text-base">
                  {PRO_FEATURES.map((line) => (
                    <li key={line} className="flex items-start gap-2 opacity-95 transition hover:translate-x-1 hover:opacity-100">
                      <span aria-hidden className="shrink-0 drop-shadow-md">
                        ⭐
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  className="relative mt-8 w-full !rounded-2xl !border-0 !bg-white !py-4 !text-lg !font-black !text-[#7C3AED] !shadow-xl transition hover:!scale-105 hover:!shadow-[0_16px_40px_-6px_rgba(255,255,255,0.55)] active:!scale-[0.99]"
                  onClick={() => setShowModal(true)}
                >
                  Upgrade Now ⚡
                </Button>
              </Card>
            </div>
          </div>
        </div>

        {/* Why Pro */}
        <section className="mt-20 lg:mt-24">
          <h2
            className="text-center text-3xl font-black text-gray-900 sm:text-4xl"
            style={{
              opacity: 0,
              animation: "winWord 0.7s ease-out forwards",
              animationDelay: "0.8s",
            }}
          >
            Why go Pro?
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {WHY_PRO.map((item, idx) => (
              <div
                key={item.title}
                style={{
                  opacity: 0,
                  animation: "winCardRise 0.6s ease-out forwards",
                  animationDelay: `${0.95 + idx * 0.12}s`,
                }}
              >
                <Card
                  className={`h-full cursor-default !rounded-2xl !border-2 !border-t-4 !border-gray-100 !border-t-gray-100 !bg-white !p-4 !shadow-md transition hover:scale-105 hover:shadow-xl ${item.border}`}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <p className="mt-2 font-black text-gray-900">{item.title}</p>
                  <p className="mt-1 text-xs font-bold text-gray-600 sm:text-sm">{item.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-20 lg:mt-24">
          <h2 className="text-center text-2xl font-black text-gray-900 sm:text-3xl">
            Players love Pro <span className="text-rose-500">❤️</span>
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={t.author}
                style={{
                  opacity: 0,
                  animation: "testimonialFade 0.65s ease-out forwards",
                  animationDelay: `${1.05 + idx * 0.15}s`,
                }}
              >
                <Card className="h-full !rounded-2xl !border !border-violet-100 !bg-white/95 !p-5 !shadow-lg transition hover:scale-[1.02] hover:shadow-xl">
                  <p className="text-sm font-black leading-snug text-gray-800 sm:text-base">&quot;{t.quote}&quot;</p>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-500 sm:text-sm">— {t.author}</p>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-20 lg:mt-24">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] p-px shadow-xl">
            <div className="flex flex-col items-center gap-6 rounded-[1.43rem] bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#EC4899] px-6 py-12 text-center sm:py-14">
              <p className="text-3xl font-black text-white drop-shadow-lg sm:text-4xl">
                Ready to party harder? <span aria-hidden>🎉</span>
              </p>
              <Button
                variant="outline"
                className="max-w-xs !rounded-2xl !border-2 !border-white/40 !bg-white !py-5 !text-xl !font-black !text-[#7C3AED] hover:!scale-110 hover:!shadow-[0_20px_50px_-10px_rgba(0,0,0,0.35)] active:!scale-105"
                onClick={celebrationConfetti}
              >
                Get Pro Now
              </Button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal ? (
          <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            style={{ animation: "winWord 0.25s ease-out forwards" }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pro-modal-title"
              className="w-full max-w-md"
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                animation: "bounceIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}
            >
              <Card className="!rounded-3xl !border !border-violet-200 !bg-white !p-8 !text-center !shadow-2xl">
                <p id="pro-modal-title" className="text-4xl font-black text-gray-900">
                  Coming Soon! <span aria-hidden>🚀</span>
                </p>
                <p className="mt-4 text-lg font-bold text-gray-600">We&apos;re working on it!</p>
                <Button
                  variant="primary"
                  className="mt-8 !w-full !rounded-2xl !bg-gradient-to-r !from-[#7C3AED] !to-[#EC4899] !py-4 !font-black !text-white"
                  onClick={() => setShowModal(false)}
                >
                  Nice! 👍
                </Button>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
