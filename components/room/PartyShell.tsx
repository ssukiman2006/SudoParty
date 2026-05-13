import Link from "next/link";
import type { ReactNode } from "react";

const floatingShapes = [
  {
    color: "bg-[#7C3AED]",
    opacity: "opacity-25",
    size: "h-[min(36vw,18rem)] w-[min(36vw,18rem)]",
    position: "-top-24 -left-24",
    delay: "0s",
  },
  {
    color: "bg-[#EC4899]",
    opacity: "opacity-25",
    size: "h-[min(34vw,17rem)] w-[min(34vw,17rem)]",
    position: "-top-16 -right-20",
    delay: "1s",
  },
  {
    color: "bg-[#FBBF24]",
    opacity: "opacity-30",
    size: "h-[min(38vw,20rem)] w-[min(38vw,20rem)]",
    position: "-bottom-32 -left-20",
    delay: "2s",
  },
  {
    color: "bg-[#10B981]",
    opacity: "opacity-20",
    size: "h-[min(32vw,16rem)] w-[min(32vw,16rem)]",
    position: "-bottom-24 -right-16",
    delay: "0.5s",
  },
  {
    color: "bg-[#F97316]",
    opacity: "opacity-25",
    size: "h-[min(28vw,14rem)] w-[min(28vw,14rem)]",
    position: "top-1/3 -right-28 hidden md:block",
    delay: "1.5s",
  },
];

type PartyShellProps = {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
};

export function PartyShell({ title, children, headerRight }: PartyShellProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#FAFAFA] px-4 pb-10 pt-6 font-party sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(236,72,153,0.08), transparent 50%), radial-gradient(ellipse 70% 40% at 100% 40%, rgba(124,58,237,0.06), transparent 45%), radial-gradient(ellipse 60% 45% at 0% 85%, rgba(251,191,36,0.07), transparent 45%)",
        }}
      />

      {floatingShapes.map((shape, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute z-0 rounded-full blur-[100px] ${shape.color} ${shape.opacity} ${shape.size} ${shape.position}`}
          style={{ animation: "float 5.5s ease-in-out infinite", animationDelay: shape.delay }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-lg">
        <header className="mb-6 flex items-center gap-2 sm:mb-8 sm:gap-3">
          <Link
            href="/"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white text-2xl shadow-md transition hover:scale-105 hover:border-[#7C3AED]/40 hover:shadow-lg active:scale-95"
            aria-label="Back to home"
          >
            ←
          </Link>
          <h1 className="min-w-0 flex-1 bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#FBBF24] bg-clip-text text-xl font-black tracking-tight text-transparent sm:text-3xl">
            {title}
          </h1>
          {headerRight ? (
            <div className="flex shrink-0 items-center justify-end">{headerRight}</div>
          ) : null}
        </header>

        {children}
      </div>
    </main>
  );
}
