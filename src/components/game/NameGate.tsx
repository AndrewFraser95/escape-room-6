import { useState } from "react";
import { useGame } from "@/lib/game";
import { whoosh } from "@/lib/sound";

export function NameGate({ onEnter }: { onEnter: () => void }) {
  const { setName } = useGame();
  const [value, setValue] = useState("");

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#050404] px-6">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-[10px] tracking-[0.5em] text-primary uppercase">
          Hollowmere House · 31 October
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight tracking-[0.12em] text-foreground uppercase sm:text-5xl">
          The Study
          <br />
          Remembers You
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Eight rooms. One door. The house would like your name for the guest book — it promises to
          use it sparingly.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!value.trim()) return;
            setName(value.trim().slice(0, 18));
            whoosh();
            onEnter();
          }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your name"
            className="flex-1 rounded-md border border-border bg-background/60 px-4 py-3 text-center font-mono text-sm text-foreground outline-none focus:border-primary sm:text-left"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-6 py-3 font-mono text-xs tracking-[0.25em] text-primary-foreground uppercase transition-colors hover:bg-primary/85"
          >
            sign in
          </button>
        </form>

        <p className="mt-6 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          headphones recommended · it uses sound
        </p>
      </div>
    </div>
  );
}
