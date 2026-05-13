import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 ${className}`}
    >
      {children}
    </div>
  );
}
