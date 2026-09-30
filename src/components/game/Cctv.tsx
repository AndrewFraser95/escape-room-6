import { useState } from "react";
import { useGame } from "@/lib/game";
import { Panel, Reward } from "./Panel";
import { sting, click as clickSfx } from "@/lib/sound";

type Frame = {
  time: string;
  door: number; // 0 closed .. 1 open
  figure: number | null; // x position in corridor
  chairGone?: boolean;
  drag?: boolean; // scuff marks from chair to door
  shadows?: number; // silhouettes behind the door's glass pane
  missing?: boolean;
};

const FRAMES: Frame[] = [
  { time: "02:58:12", door: 0, figure: null },
  { time: "02:58:40", door: 0, figure: 40 },
  { time: "02:59:08", door: 0.6, figure: 150 },
  { time: "02:59:36", door: 0, figure: null, shadows: 1, missing: true },
  { time: "03:00:04", door: 0, figure: null, chairGone: true, drag: true, shadows: 1 },
  { time: "03:00:32", door: 0, figure: null, chairGone: true, drag: true, shadows: 2 },
];

const OPTIONS = [
  { id: "left", label: "The figure came back out, took the chair and walked away." },
  { id: "sat", label: "The figure came out, sat on the chair, then went back in." },
  { id: "nothing", label: "Nothing. The camera simply skipped." },
  { id: "two", label: "The chair was dragged into the study. Now there are two in there." },
];

export function Cctv() {
  const { solve, isSolved, addNote } = useGame();
  const solved = isSolved("cctv");
  const [picked, setPicked] = useState<string | null>(null);
  const [scrub, setScrub] = useState(0);

  const frame = FRAMES[scrub]!;

  const choose = (id: string) => {
    setPicked(id);
    if (id === "two") {
      clickSfx();
      solve("cctv");
      addNote("Camera 03 gave up a 2.");
    } else {
      sting(110, 0.5);
    }
  };

  return (
    <Panel id="cctv" hint="Watch the study first.">
      <p className="text-sm text-muted-foreground">
        Camera 03, corridor outside the study. One frame has been wiped from the drive. Scrub
        through and work out what happened in the gap.
      </p>

      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-md border border-border bg-black">
        {frame.missing ? (
          <div className="grid h-full w-full place-items-center bg-[repeating-linear-gradient(0deg,#0a0a0a_0px,#111_2px,#000_4px)]">
            <span className="animate-glitch font-mono text-xs tracking-[0.3em] text-primary uppercase">
              frame removed
            </span>
          </div>
        ) : (
          <svg viewBox="0 0 320 180" className="h-full w-full">
            <rect width="320" height="180" fill="#0c0d0c" />
            <rect x="0" y="120" width="320" height="60" fill="#121412" />
            {/* doorway with frosted pane */}
            <rect x="180" y="40" width="60" height="85" fill="#1a1d1a" stroke="#242824" />
            <rect
              x="180"
              y="40"
              width={60 * (1 - frame.door)}
              height="85"
              fill="#0e100e"
              stroke="#20241f"
            />
            {frame.door === 0 && (
              <>
                <rect x="192" y="50" width="36" height="26" fill="#2a2f27" opacity="0.7" />
                {Array.from({ length: frame.shadows ?? 0 }).map((_, i) => (
                  <g key={i} fill="#0b0c0a" opacity="0.8">
                    <ellipse cx={203 + i * 14} cy="60" rx="4" ry="5" />
                    <rect x={199 + i * 14} y="64" width="8" height="12" />
                  </g>
                ))}
              </>
            )}
            {frame.drag && (
              <path
                d="M75 128 Q130 132 185 124 M80 132 Q135 136 188 128"
                stroke="#2a2e28"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="3 4"
              />
            )}
            {!frame.chairGone && (
              <g fill="#23281f">
                <rect x="60" y="100" width="34" height="6" />
                <rect x="60" y="70" width="6" height="32" />
                <rect x="62" y="106" width="4" height="22" />
                <rect x="88" y="106" width="4" height="22" />
              </g>
            )}
            {frame.figure !== null && (
              <g opacity="0.85">
                <ellipse cx={frame.figure + 40} cy="66" rx="9" ry="11" fill="#2e332c" />
                <path d={`M${frame.figure + 26} 128 q14 -50 28 0 z`} fill="#262b24" />
              </g>
            )}
          </svg>
        )}
        <div className="pointer-events-none absolute inset-0 animate-scan bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.045)_50%,transparent_100%)] bg-[length:100%_10px]" />
        <div className="absolute top-2 left-3 font-mono text-[10px] tracking-widest text-accent/80">
          CAM 03
        </div>
        <div className="absolute top-2 right-3 font-mono text-[10px] tracking-widest text-accent/80">
          {frame.time}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={FRAMES.length - 1}
        value={scrub}
        onChange={(e) => setScrub(Number(e.target.value))}
        className="mt-4 w-full accent-[var(--color-primary)]"
        aria-label="Scrub footage"
      />
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        {FRAMES.map((f) => (
          <span key={f.time} className={f.missing ? "text-primary" : ""}>
            {f.missing ? "??" : f.time.slice(-2)}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => choose(o.id)}
            disabled={solved}
            className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
              picked === o.id && o.id === "two"
                ? "border-accent bg-accent/10 text-accent"
                : picked === o.id
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-background/40 text-foreground/80 hover:border-primary/50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {picked && !solved && (
        <p className="mt-3 font-mono text-xs text-primary">The drive disagrees. Count the chair.</p>
      )}

      {solved && (
        <Reward
          digit="2"
          text="The chair is gone at 03:00:04 but the door never opened wide enough. Something already inside carried it."
        />
      )}
    </Panel>
  );
}
