import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/game";
import { Panel, Reward } from "./Panel";
import { sting, click as clickSfx } from "@/lib/sound";

export function Torch() {
  const { solve, isSolved, addNote, name } = useGame();
  const solved = isSolved("torch");
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [flicker, setFlicker] = useState(false);
  const [radius, setRadius] = useState(120);

  useEffect(() => {
    const id = window.setInterval(
      () => {
        setFlicker(true);
        sting(70, 0.25, "triangle");
        window.setTimeout(() => setFlicker(false), 420);
      },
      7000 + Math.random() * 4000,
    );
    return () => window.clearInterval(id);
  }, []);

  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
    setRadius(110 + Math.random() * 18);
  };

  const mask = `radial-gradient(circle ${radius}px at ${pos.x}% ${pos.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 78%)`;

  return (
    <Panel id="torch" hint="Listen to the tape first.">
      <p className="text-sm text-muted-foreground">
        The hall light is dead. Your cursor is the only torch you have. Find what is written on the
        wall — and the number scratched beside it.
      </p>

      <div
        ref={ref}
        onMouseMove={move}
        className="relative mt-4 h-80 w-full cursor-none overflow-hidden rounded-md border border-border bg-[#040404] select-none"
      >
        {/* wall content, revealed by the torch mask */}
        <div className="absolute inset-0" style={{ WebkitMaskImage: mask, maskImage: mask }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#1a1512,#0a0908)]" />
          <p className="absolute top-10 left-8 max-w-sm font-display text-2xl leading-relaxed tracking-wide text-[#7c2c22]">
            IT COUNTS THE ROOMS
            <br />
            AND THEN IT COUNTS US
          </p>
          <p className="absolute right-12 bottom-24 rotate-[-6deg] font-mono text-xs text-[#5e4730]">
            {name ? `${name.toUpperCase()} WAS HERE` : "SOMEONE WAS HERE"}
            <br />
            {name ? `${name.toUpperCase()} IS STILL HERE` : "AND NEVER LEFT"}
          </p>
          <button
            onClick={() => {
              clickSfx();
              solve("torch");
              addNote("The hall gave up a 4.");
            }}
            className="absolute bottom-10 left-16 font-display text-5xl text-[#8a3226] transition-colors hover:text-primary"
            aria-label="Scratched number"
          >
            4
          </button>
          <span className="absolute top-1/2 left-1/2 font-mono text-[10px] text-[#3a2c22]">
            don't turn around
          </span>
        </div>

        {/* torch glow */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            background: `radial-gradient(circle ${radius * 0.9}px at ${pos.x}% ${pos.y}%, rgba(255,190,110,0.12), transparent 70%)`,
          }}
        />

        {/* flicker: full reveal of a figure */}
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-150 ${
            flicker ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-[#1b1512]" />
          <svg viewBox="0 0 400 320" className="absolute inset-0 h-full w-full">
            <ellipse cx="320" cy="120" rx="16" ry="20" fill="#0b0908" />
            <path d="M292 300 q28 -130 56 0 z" fill="#0b0908" />
          </svg>
        </div>
      </div>

      {solved && (
        <Reward digit="4" text="Scratched into the plaster, deep enough to reach brick." />
      )}
    </Panel>
  );
}
