import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/game";
import { Panel, Reward } from "./Panel";
import { speak, stopSpeaking, sting, click as clickSfx, whoosh } from "@/lib/sound";

const LINES: { at: number; who: "a" | "b"; text: string }[] = [
  { at: 0, who: "a", text: "Recording. Third attempt. The rooms give numbers." },
  { at: 5, who: "a", text: "The order is. Camera. Hall. Study. Glass." },
  { at: 11, who: "b", text: "don't use that one" },
  { at: 14, who: "a", text: "Say it once more for the tape. Camera. Hall. Study. Glass." },
  { at: 21, who: "b", text: "the last room she names goes first" },
  { at: 26, who: "a", text: "Who is there? Who said that?" },
  { at: 29, who: "b", text: "the eye that watches always goes last" },
  { at: 34, who: "b", text: "and the dark comes straight after the room that changed" },
  { at: 40, who: "a", text: "Stop the tape. Stop the—" },
];
const END = 44;

const ROOMS = ["Study", "Camera", "Glass", "Hall"] as const;
const ANSWER = ["Glass", "Study", "Hall", "Camera"];

/** Obscure some characters of the whisper deterministically, like tape damage. */
function damage(text: string) {
  return text
    .split("")
    .map((c, i) => (c !== " " && (i * 7 + text.length) % 5 === 0 ? "▒" : c))
    .join("");
}

export function Recording() {
  const { solve, isSolved } = useGame();
  const solved = isSolved("recording");
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [heard, setHeard] = useState<typeof LINES>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [fail, setFail] = useState(0);
  const spoken = useRef(new Set<number>());

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setT((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    LINES.forEach((line, i) => {
      if (line.at === t && !spoken.current.has(i)) {
        spoken.current.add(i);
        setHeard((h) => [...h, line]);
        if (line.who === "a") speak(line.text, { pitch: 0.35, rate: 0.8 });
        else {
          whoosh();
          speak(line.text, { pitch: 1.8, rate: 0.62 });
        }
      }
    });
    if (t > END) setPlaying(false);
  }, [t, playing]);

  useEffect(() => () => stopSpeaking(), []);

  const pick = (room: string) => {
    if (solved || order.includes(room)) return;
    clickSfx();
    const next = [...order, room];
    setOrder(next);
    if (next.length === 4) {
      window.setTimeout(() => {
        if (next.join() === ANSWER.join()) {
          solve("recording");
        } else {
          sting(100, 0.6);
          setFail((f) => f + 1);
          setOrder([]);
        }
      }, 300);
    }
  };

  return (
    <Panel id="recording" hint="Clear the camera first.">
      <p className="text-sm text-muted-foreground">
        A dictaphone tape. Two people are on it. Only one of them knew they were being recorded. The
        tape is damaged — listen, don't just read. Headphones, ideally.
      </p>

      <div className="mt-4 rounded-md border border-border bg-background/60 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (playing) {
                setPlaying(false);
                stopSpeaking();
              } else {
                spoken.current.clear();
                setHeard([]);
                setT(0);
                setPlaying(true);
              }
            }}
            className="rounded-full border border-primary px-5 py-2 font-mono text-xs tracking-[0.25em] text-primary uppercase transition-colors hover:bg-primary/15"
          >
            {playing ? "stop" : "play tape"}
          </button>
          <div className="h-8 flex-1 overflow-hidden rounded bg-black/50">
            <div className="flex h-full items-center gap-[2px] px-2">
              {Array.from({ length: 60 }).map((_, i) => (
                <span
                  key={i}
                  className="w-[3px] bg-accent/70"
                  style={{
                    height: playing ? `${18 + Math.abs(Math.sin((i + t) * 0.7)) * 60}%` : "8%",
                    transition: "height 400ms ease",
                  }}
                />
              ))}
            </div>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            0:{String(Math.min(t, END)).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-4 min-h-28 space-y-1 font-mono text-xs">
          {heard.map((l, i) => (
            <p
              key={i}
              className={
                l.who === "a" ? "text-foreground/85" : "animate-flicker pl-6 text-primary italic"
              }
            >
              {l.who === "a" ? "VOICE 1: " : "…: "}
              {l.who === "a" ? l.text : damage(l.text)}
            </p>
          ))}
          {!heard.length && <p className="text-muted-foreground">transcript will appear here…</p>}
        </div>
      </div>

      <p className="mt-5 text-sm text-foreground/80">Put the rooms in the order you trust.</p>
      <div className="mt-2 flex min-h-10 flex-wrap gap-2 font-mono text-sm text-accent">
        {order.map((r, i) => (
          <span key={r} className="rounded border border-accent/50 px-3 py-1">
            {i + 1}. {r}
          </span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ROOMS.map((r) => (
          <button
            key={r}
            disabled={solved || order.includes(r)}
            onClick={() => pick(r)}
            className="rounded-md border border-border bg-background/40 px-4 py-3 font-mono text-sm text-foreground/80 transition-colors hover:border-primary/50 disabled:opacity-30"
          >
            {r}
          </button>
        ))}
      </div>

      {fail > 0 && !solved && (
        <p className="mt-3 font-mono text-xs text-primary">
          {fail > 2
            ? "Three rules in the whisper. Each one fixes a room."
            : "The tape rewinds itself."}
        </p>
      )}

      {solved && (
        <Reward
          digit="?"
          text="The whisper was right. Remember the order — nobody will write it down for you."
        />
      )}
    </Panel>
  );
}
