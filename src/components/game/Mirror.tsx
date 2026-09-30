import { useState } from "react";
import { useGame } from "@/lib/game";
import { Panel, Reward } from "./Panel";
import { sting, click as clickSfx } from "@/lib/sound";

// Candle x positions in the room. The reflection is mirrored, so these flip.
const ROOM_CANDLES = [22, 48, 71, 101, 124, 196, 219, 247, 276];
// In the reflection one candle sits where no candle stands in the room (after flipping).
const EXTRA_X = 160; // mirrors to x=134 in the room, where there is none

/** One candle in the glass has no twin in the room. Same colour, same flame. */
export function Mirror() {
  const { solve, isSolved, addNote } = useGame();
  const solved = isSolved("mirror");
  const [wrong, setWrong] = useState(0);

  const miss = () => {
    if (solved) return;
    setWrong((w) => w + 1);
    sting(130, 0.35);
  };

  const Candle = ({ x, h = 40, onHit }: { x: number; h?: number; onHit?: () => void }) => (
    <g
      onClick={(e) => {
        e.stopPropagation();
        (onHit ?? miss)();
      }}
      className="cursor-crosshair"
    >
      <rect x={x} y={190 - h} width="5" height={h} fill="#bfb198" />
      <ellipse
        cx={x + 2.5}
        cy={184 - h}
        rx="2.6"
        ry="5.5"
        fill="#e39a3c"
        className="animate-flicker"
      />
      <rect x={x - 6} y={140} width="17" height="52" fill="transparent" />
    </g>
  );

  const heights = [40, 34, 44, 38, 30, 42, 36, 40, 33];

  const Room = ({ reflected }: { reflected: boolean }) => (
    <svg
      viewBox="0 0 300 260"
      className="h-full w-full"
      style={reflected ? { transform: "scaleX(-1)" } : undefined}
    >
      <rect width="300" height="260" fill={reflected ? "#0b0b0c" : "#0c0a09"} />
      <rect y="190" width="300" height="70" fill="#131010" />
      <rect x="230" y="40" width="40" height="52" fill="#16110e" stroke="#241b15" />
      <ellipse cx="150" cy="96" rx="20" ry="24" fill="#241c18" />
      <path d="M116 200 q34 -90 68 0 z" fill="#1d1613" />
      <circle cx="143" cy="94" r="2.5" fill="#6d5b47" />
      <circle cx="157" cy="94" r="2.5" fill="#6d5b47" />
      {ROOM_CANDLES.map((x, i) => (
        <Candle key={x} x={x} h={heights[i] ?? 40} />
      ))}
      {reflected && (
        <Candle
          x={EXTRA_X}
          h={31}
          onHit={() => {
            if (solved) return;
            clickSfx();
            solve("mirror");
            addNote("The glass gave up a 9.");
          }}
        />
      )}
    </svg>
  );

  return (
    <Panel id="mirror" hint="Light the hall first.">
      <p className="text-sm text-muted-foreground">
        The room, and the room in the glass. They are not the same room. Touch the thing that only
        the mirror can see. The glass does not forgive guessing.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div
          onClick={miss}
          className="aspect-[300/260] overflow-hidden rounded-md border border-border bg-black"
        >
          <Room reflected={false} />
        </div>
        <div
          onClick={miss}
          className="relative aspect-[300/260] overflow-hidden rounded-md border border-accent/30 bg-black shadow-[inset_0_0_60px_-10px_rgba(200,60,40,0.25)]"
        >
          <Room reflected />
          <span className="pointer-events-none absolute right-2 bottom-2 font-mono text-[10px] tracking-widest text-accent/60 uppercase">
            reflection
          </span>
        </div>
      </div>

      {wrong > 0 && !solved && (
        <p className="mt-3 font-mono text-xs text-primary">
          {wrong > 4 ? "Count them. Then count them again, backwards." : "That one has a twin."}
        </p>
      )}

      {solved && (
        <Reward
          digit="9"
          text="Nine flames in the room. Ten in the glass. Someone lit one for you."
        />
      )}
    </Panel>
  );
}
