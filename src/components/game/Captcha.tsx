import { useState } from "react";
import { useGame } from "@/lib/game";
import { Panel, Reward } from "./Panel";
import { sting, click as clickSfx, whoosh } from "@/lib/sound";

type Kind = "empty" | "ghost" | "sheet";
type Cell = { kind: Kind; op: number; dx: number; dy: number; s: number };

const N = 16;
const cell = (kind: Kind, op = 0.2, dx = 0, dy = 0, s = 1): Cell => ({ kind, op, dx, dy, s });

// Round 1: faint, partial, off-edge ghosts plus eyeless sheets as decoys.
const ROUND_1: Cell[] = Array.from({ length: N }, () => cell("empty"));
ROUND_1[2] = cell("ghost", 0.16, 30, 10, 0.8); // half off the right edge
ROUND_1[5] = cell("ghost", 0.12, -6, 8, 0.5); // tiny, far away
ROUND_1[11] = cell("ghost", 0.22, -34, 0, 1); // peeking in from the left
ROUND_1[14] = cell("ghost", 0.1, 0, 40, 0.9); // only the top of the head
ROUND_1[0] = cell("sheet", 0.3, 4, 6, 0.9);
ROUND_1[9] = cell("sheet", 0.22, -10, 12, 0.7);
ROUND_1[13] = cell("sheet", 0.18, 20, 4, 0.8);

// Round 2: everything is occupied — except one sheet that has no eyes.
const ROUND_2: Cell[] = Array.from({ length: N }, (_, i) =>
  cell(
    "ghost",
    0.14 + ((i * 7) % 5) * 0.03,
    ((i * 13) % 30) - 15,
    ((i * 11) % 20) - 5,
    0.6 + ((i * 3) % 4) * 0.12,
  ),
);
ROUND_2[10] = cell("sheet", 0.2, -4, 6, 0.8);

const answer = (cells: Cell[]) =>
  cells.map((c, i) => (c.kind === "ghost" ? i : -1)).filter((i) => i >= 0);

function Tile({ c, index }: { c: Cell; index: number }) {
  const hue = 200 + ((index * 23) % 40);
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect width="100" height="100" fill={`hsl(${hue} 8% ${7 + (index % 3) * 3}%)`} />
      <rect y={60 + (index % 4) * 5} width="100" height="40" fill="#0e0e0f" />
      <rect x={10 + (index % 5) * 8} y="30" width="26" height="40" fill="#141416" />
      <rect x={58} y="22" width="30" height="48" fill="#111113" />
      {c.kind !== "empty" && (
        <g
          className="animate-breathe"
          opacity={c.op}
          transform={`translate(${50 + c.dx} ${55 + c.dy}) scale(${c.s}) translate(-50 -55)`}
        >
          <ellipse cx="50" cy="42" rx="13" ry="16" fill="#cfd6d8" />
          <path d="M34 82 q16 -46 32 0 q-8 -8 -16 0 q-8 8 -16 0 z" fill="#cfd6d8" />
          {c.kind === "ghost" && (
            <>
              <circle cx="45" cy="42" r="2.4" fill="#000" />
              <circle cx="55" cy="42" r="2.4" fill="#000" />
            </>
          )}
        </g>
      )}
    </svg>
  );
}

export function Captcha() {
  const { solve, isSolved, addNote, name } = useGame();
  const solved = isSolved("captcha");
  const [round, setRound] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const cells = round === 1 ? ROUND_1 : ROUND_2;

  const toggle = (i: number) => {
    if (solved) return;
    clickSfx();
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  };

  const verify = () => {
    const want = answer(cells).sort().join(",");
    const got = [...selected].sort().join(",");
    if (want !== got) {
      sting(120, 0.4);
      setMessage("Verification failed. Select ALL squares containing a ghost. Only ghosts.");
      return;
    }
    if (round === 1) {
      whoosh();
      setRound(2);
      setSelected([]);
      setMessage("Verification failed. Please try again.");
      return;
    }
    clickSfx();
    solve("captcha");
    addNote("The verification decided you are not a visitor.");
  };

  return (
    <Panel id="captcha" hint="Look in the glass first.">
      <div className="mx-auto max-w-sm overflow-hidden rounded-md border border-border bg-[#0d0e10]">
        <div className="bg-[#16181c] px-4 py-3">
          <p className="text-xs text-muted-foreground">Select all squares with</p>
          <p className="font-display text-lg tracking-wide text-foreground">a ghost</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            if there are none, click verify. sheets are not ghosts. ghosts look back.
          </p>
          {round === 2 && (
            <p className="mt-1 animate-flicker font-mono text-[10px] text-primary">
              they are nearly all occupied now, {name || "visitor"}
            </p>
          )}
        </div>
        <div className="grid grid-cols-4 gap-[2px] bg-border p-[2px]">
          {cells.map((c, i) => (
            <button
              key={`${round}-${i}`}
              onClick={() => toggle(i)}
              className={`relative aspect-square overflow-hidden transition-transform ${
                selected.includes(i) ? "scale-[0.86] ring-2 ring-accent" : ""
              }`}
            >
              <Tile c={c} index={i} />
              {selected.includes(i) && (
                <span className="absolute top-1 left-1 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] text-background">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between bg-[#16181c] px-4 py-3">
          <span className="font-mono text-[10px] text-muted-foreground">
            reCAPTCHA · not affiliated
          </span>
          <button
            onClick={verify}
            disabled={solved}
            className="rounded bg-primary px-4 py-1.5 font-mono text-xs tracking-widest text-primary-foreground uppercase disabled:opacity-40"
          >
            verify
          </button>
        </div>
      </div>

      {message && !solved && (
        <p className="mt-3 text-center font-mono text-xs text-primary">{message}</p>
      )}

      {solved && (
        <Reward
          digit="✓"
          text="Verified. The house has decided you are not a visitor. Her diary unlocks."
        />
      )}
    </Panel>
  );
}
