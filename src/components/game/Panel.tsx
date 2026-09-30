import type { ReactNode } from "react";
import { useGame, type StageId, STAGE_TITLES } from "@/lib/game";

export function Panel({ id, children, hint }: { id: StageId; children: ReactNode; hint?: string }) {
  const { isUnlocked, isSolved } = useGame();
  const unlocked = isUnlocked(id);
  const solved = isSolved(id);

  return (
    <section
      id={id}
      className={`relative overflow-hidden rounded-lg border border-border bg-card/70 shadow-[0_0_60px_-30px_var(--color-primary)] backdrop-blur-sm transition-all duration-700 ${
        unlocked ? "opacity-100" : "pointer-events-none max-h-56 opacity-40 grayscale"
      }`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <h2 className="font-display text-lg tracking-[0.25em] text-foreground uppercase">
          {STAGE_TITLES[id]}
        </h2>
        <span
          className={`font-mono text-[10px] tracking-[0.2em] uppercase ${
            solved ? "text-accent" : unlocked ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {solved ? "released" : unlocked ? "open" : "sealed"}
        </span>
      </header>

      {unlocked ? (
        <div className="p-5">{children}</div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            locked
          </p>
          <p className="text-sm text-muted-foreground italic">
            {hint ?? "Something before this must be finished first."}
          </p>
        </div>
      )}
    </section>
  );
}

export function Reward({ digit, text }: { digit: string; text: string }) {
  return (
    <div className="mt-5 flex items-center gap-4 rounded-md border border-accent/40 bg-accent/10 px-4 py-3">
      <span className="font-display text-3xl text-accent">{digit}</span>
      <p className="text-sm text-foreground/80">{text}</p>
    </div>
  );
}
