import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/game";
import { Panel, Reward } from "./Panel";
import { sting, whoosh, click as clickSfx } from "@/lib/sound";

type ChangeId = "portrait" | "candle" | "clock" | "chair" | "book";

const CHANGES: Record<ChangeId, string> = {
  portrait: "The portrait turned its head to face you.",
  candle: "The candle went out. Nobody blew it out.",
  clock: "The clock hands moved backwards to 3:07.",
  chair: "The chair is now pulled away from the desk. Someone sat down.",
  book: "A second book appeared, open, still wet.",
};

export function Study() {
  const { solve, isSolved, addNote } = useGame();
  const solved = isSolved("study");
  const [watching, setWatching] = useState(false);
  const [changed, setChanged] = useState<ChangeId | null>(null);
  const [wrong, setWrong] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!watching || changed) return;
    const keys = Object.keys(CHANGES) as ChangeId[];
    const pick = keys[Math.floor(Math.random() * keys.length)]!;
    timer.current = window.setTimeout(() => {
      setChanged(pick);
      whoosh();
    }, 20000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [watching, changed]);

  const guess = (id: ChangeId) => {
    if (solved || !changed) {
      setWrong((w) => w + 1);
      sting(120, 0.4);
      return;
    }
    if (id === changed) {
      clickSfx();
      solve("study");
      addNote("The study gave up a 7.");
    } else {
      setWrong((w) => w + 1);
      sting(120, 0.4);
    }
  };

  const hot = "cursor-crosshair transition-all duration-1000";

  return (
    <Panel id="study">
      <p className="text-sm text-muted-foreground">
        Sit still and watch the room. Nothing in here stays honest for long. When something is
        wrong, click it.
      </p>

      <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-md border border-border bg-[#0b0908]">
        <svg viewBox="0 0 640 360" className="h-full w-full">
          <defs>
            <radialGradient id="lamp" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#4a3218" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#070605" stopOpacity="1" />
            </radialGradient>
          </defs>
          <rect width="640" height="360" fill="url(#lamp)" />
          {/* wall panels */}
          {[40, 140, 240, 340, 440, 540].map((x) => (
            <rect key={x} x={x} y={20} width="80" height="200" fill="#140f0b" stroke="#241a12" />
          ))}
          {/* floor */}
          <rect y="250" width="640" height="110" fill="#100b08" />

          {/* portrait */}
          <g className={hot} onClick={() => guess("portrait")}>
            <rect
              x="60"
              y="50"
              width="110"
              height="130"
              fill="#1c1410"
              stroke="#3b2a1b"
              strokeWidth="4"
            />
            <ellipse cx="115" cy="105" rx="30" ry="38" fill="#2a2018" />
            <g
              style={{
                transform: changed === "portrait" ? "translateX(0px)" : "translateX(-6px)",
                transition: "transform 1.4s ease-in-out",
              }}
            >
              <circle cx="105" cy="100" r="4" fill="#c9412e" />
              <circle cx="125" cy="100" r="4" fill="#c9412e" />
            </g>
            <path d="M100 125 q15 10 30 0" stroke="#3b2a1b" fill="none" strokeWidth="2" />
          </g>

          {/* clock */}
          <g className={hot} onClick={() => guess("clock")}>
            <circle cx="320" cy="95" r="38" fill="#150f0b" stroke="#3b2a1b" strokeWidth="3" />
            <line
              x1="320"
              y1="95"
              x2="320"
              y2="70"
              stroke="#8a6a3c"
              strokeWidth="3"
              style={{
                transformOrigin: "320px 95px",
                transform: changed === "clock" ? "rotate(-125deg)" : "rotate(0deg)",
                transition: "transform 1.6s ease-in-out",
              }}
            />
            <line
              x1="320"
              y1="95"
              x2="344"
              y2="95"
              stroke="#8a6a3c"
              strokeWidth="2"
              style={{
                transformOrigin: "320px 95px",
                transform: changed === "clock" ? "rotate(92deg)" : "rotate(0deg)",
                transition: "transform 1.6s ease-in-out",
              }}
            />
          </g>

          {/* candle */}
          <g className={hot} onClick={() => guess("candle")}>
            <rect x="470" y="150" width="14" height="50" fill="#d9cbb0" />
            <g
              style={{
                opacity: changed === "candle" ? 0 : 1,
                transition: "opacity 1.2s ease-in",
              }}
            >
              <ellipse
                cx="477"
                cy="140"
                rx="7"
                ry="14"
                fill="#f0a33a"
                className="animate-flicker"
              />
              <ellipse cx="477" cy="144" rx="3" ry="7" fill="#fde9b0" />
            </g>
          </g>

          {/* desk */}
          <rect x="220" y="215" width="260" height="16" fill="#241a12" />
          <rect x="235" y="231" width="14" height="60" fill="#1b130d" />
          <rect x="451" y="231" width="14" height="60" fill="#1b130d" />

          {/* book(s) */}
          <g className={hot} onClick={() => guess("book")}>
            <rect x="255" y="200" width="54" height="15" fill="#5a2320" />
            <rect
              x="330"
              y="198"
              width="60"
              height="17"
              fill="#3d2b52"
              style={{
                opacity: changed === "book" ? 1 : 0,
                transition: "opacity 1.4s ease-in",
              }}
            />
          </g>

          {/* chair */}
          <g
            className={hot}
            onClick={() => guess("chair")}
            style={{
              transform: changed === "chair" ? "translate(34px, 8px)" : "translate(0,0)",
              transition: "transform 1.8s ease-in-out",
            }}
          >
            <rect x="300" y="240" width="60" height="10" fill="#2b1f15" />
            <rect x="300" y="200" width="10" height="45" fill="#2b1f15" />
            <rect x="303" y="250" width="6" height="45" fill="#221810" />
            <rect x="351" y="250" width="6" height="45" fill="#221810" />
          </g>

          {!watching && <rect width="640" height="360" fill="#050403" opacity="0.82" />}
        </svg>

        {!watching && (
          <button
            onClick={() => {
              setWatching(true);
              sting(90, 1.2, "triangle");
            }}
            className="absolute inset-0 grid place-items-center font-mono text-xs tracking-[0.35em] text-primary uppercase"
          >
            begin watching
          </button>
        )}

        {watching && !changed && !solved && (
          <span className="pointer-events-none absolute right-3 bottom-3 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            observing…
          </span>
        )}
      </div>

      {wrong > 0 && !solved && (
        <p className="mt-3 font-mono text-xs text-primary">
          {wrong > 2
            ? "You are looking where it wants you to look."
            : "Nothing wrong with that. Yet."}
        </p>
      )}

      {solved && changed && <Reward digit="7" text={CHANGES[changed]} />}
    </Panel>
  );
}
