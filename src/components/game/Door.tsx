import { useState } from "react";
import { useGame, FINAL_CODE } from "@/lib/game";
import { Panel } from "./Panel";
import { sting, click as clickSfx, whoosh } from "@/lib/sound";

export function Door() {
  const { solve, isSolved, setEscaped, name } = useGame();
  const solved = isSolved("door");
  const [entry, setEntry] = useState("");
  const [shake, setShake] = useState(false);

  const press = (d: string) => {
    if (solved) return;
    clickSfx();
    const next = (entry + d).slice(0, 4);
    setEntry(next);
    if (next.length === 4) {
      window.setTimeout(() => {
        if (next === FINAL_CODE) {
          whoosh();
          solve("door");
          setEscaped(true);
        } else {
          sting(90, 0.7);
          setShake(true);
          window.setTimeout(() => {
            setShake(false);
            setEntry("");
          }, 600);
        }
      }, 250);
    }
  };

  return (
    <Panel id="door" hint="Read her diary first.">
      <p className="text-sm text-muted-foreground">
        A brass keypad, warm to the touch. Four numbers.
      </p>

      <div
        className={`mx-auto mt-5 w-56 rounded-lg border border-accent/40 bg-[#14100c] p-4 ${
          shake ? "animate-shake" : ""
        }`}
      >
        <div className="mb-4 flex justify-center gap-2 rounded bg-black/60 py-3">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="grid h-9 w-8 place-items-center rounded border border-border font-display text-xl text-accent"
            >
              {solved ? FINAL_CODE[i] : entry[i] ? "•" : ""}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""].map((d, i) =>
            d ? (
              <button
                key={i}
                onClick={() => press(d)}
                className="rounded border border-border bg-background/50 py-2 font-display text-lg text-foreground/85 transition-colors hover:border-accent hover:text-accent"
              >
                {d}
              </button>
            ) : (
              <span key={i} />
            ),
          )}
        </div>
      </div>

      {solved && (
        <div className="mt-6 animate-fade-in text-center">
          <p className="font-display text-2xl tracking-[0.2em] text-accent uppercase">
            the door opens
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Cold air. A corridor that was not there an hour ago. Behind you the study light goes out
            on its own, and the tape clicks on one more time to say a single word:{" "}
            <span className="text-primary">{name || "your name"}</span>.
            <br />
            <br />
            You are out. Something else is too.
          </p>
        </div>
      )}
    </Panel>
  );
}
