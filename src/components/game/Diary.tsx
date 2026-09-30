import { useState } from "react";
import { useGame } from "@/lib/game";
import { Panel, Reward } from "./Panel";
import { click as clickSfx, whoosh, sting } from "@/lib/sound";

export function Diary() {
  const { solve, isSolved, name } = useGame();
  const solved = isSolved("diary");
  const [page, setPage] = useState(0);
  const [guess, setGuess] = useState("");
  const [wrong, setWrong] = useState(false);
  const who = name || "the visitor";

  const pages = [
    {
      date: "14th October",
      body: `Father says the house settles. It does not settle, it arranges. Last night the study chair was turned to face the door again. I have taken to lighting candles in the hall — one for each of us who still lives here. Father, Mother, Edwin, Nan, Cook, Alice, the twins, and me.`,
    },
    {
      date: "23rd October",
      body: `Two voices on the tape and only one of them is mine. The other keeps saying a name I do not know yet. ${who}. ${who}. ${who}. Alice disappeared on Tuesday. I did not light hers tonight.`,
    },
    {
      date: "29th October",
      body: `It wrote on the hall wall, in my own handwriting, while I was holding the pen at my side. Cook has gone and will not say why. One of the twins will not wake. I light only for the ones still breathing.`,
    },
    {
      date: "31st October",
      body: `Tonight there were more flames than I lit. ${who} lit the extra one — I watched them do it in the glass before they ever arrived. I have put a clasp on this book. It opens for the number of candles I lit tonight.`,
    },
  ];

  const p = pages[page]!;
  const last = page === pages.length - 1;

  const tryClasp = () => {
    if (guess.trim() === "6" || guess.trim().toLowerCase() === "six") {
      whoosh();
      solve("diary");
    } else {
      sting(110, 0.4);
      setWrong(true);
      setGuess("");
    }
  };

  return (
    <Panel id="diary" hint="Prove you are human first.">
      <div className="relative rounded-md border border-border bg-[#17130e] p-6 shadow-inner">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0px,transparent_27px,rgba(255,255,255,0.03)_28px)]" />
        <p className="font-mono text-xs tracking-widest text-accent/70 uppercase">{p.date}</p>
        <p className="mt-3 font-display text-lg leading-relaxed text-[#d8c8a8]">{p.body}</p>
        {solved && last && (
          <p className="mt-4 animate-fade-in font-display text-base leading-relaxed text-primary">
            Under the clasp, fresher ink: the door is real. It opens once. {who}, you are already
            later than I was.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => {
            clickSfx();
            setPage((v) => Math.max(0, v - 1));
          }}
          disabled={page === 0}
          className="rounded border border-border px-4 py-2 font-mono text-xs tracking-widest uppercase disabled:opacity-30"
        >
          back
        </button>
        <span className="font-mono text-xs text-muted-foreground">
          {page + 1} / {pages.length}
        </span>
        <button
          onClick={() => {
            clickSfx();
            setPage((v) => v + 1);
          }}
          disabled={last}
          className="rounded border border-border px-4 py-2 font-mono text-xs tracking-widest uppercase hover:border-primary disabled:opacity-30"
        >
          turn page
        </button>
      </div>

      {last && !solved && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            tryClasp();
          }}
          className="mt-5 flex items-center justify-center gap-2"
        >
          <span className="font-mono text-xs text-muted-foreground">the clasp:</span>
          <input
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setWrong(false);
            }}
            maxLength={4}
            className="w-16 rounded border border-border bg-background/60 px-2 py-1 text-center font-mono text-sm text-foreground outline-none focus:border-primary"
            aria-label="Clasp number"
          />
          <button className="rounded border border-primary px-4 py-1.5 font-mono text-xs tracking-widest text-primary uppercase hover:bg-primary/15">
            open
          </button>
        </form>
      )}
      {wrong && !solved && (
        <p className="mt-2 text-center font-mono text-xs text-primary">
          The clasp stays shut. Count who is left.
        </p>
      )}

      {solved && (
        <Reward
          digit="✶"
          text="The clasp gives. Four numbers. One door. You already know the order."
        />
      )}
    </Panel>
  );
}
