import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GameProvider, useGame, STAGE_ORDER, STAGE_TITLES } from "@/lib/game";
import { NameGate } from "@/components/game/NameGate";
import { Study } from "@/components/game/Study";
import { Cctv } from "@/components/game/Cctv";
import { Recording } from "@/components/game/Recording";
import { Torch } from "@/components/game/Torch";
import { Mirror } from "@/components/game/Mirror";
import { Captcha } from "@/components/game/Captcha";
import { Diary } from "@/components/game/Diary";
import { Door } from "@/components/game/Door";
import { Phone } from "@/components/game/Phone";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Study Remembers You — A Halloween Escape Room" },
      {
        name: "description",
        content:
          "A single-room Halloween puzzle sim: spot what changed, read the missing CCTV frame, trust the wrong voice, and open the door before it opens you.",
      },
      { property: "og:title", content: "The Study Remembers You — A Halloween Escape Room" },
      {
        property: "og:description",
        content:
          "Eight haunted puzzles, one door. Torchlight, tape recordings, a mirror that lies, and a phone that heckles you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#050404" },
    ],
    links: [{ rel: "manifest", href: "/manifest.webmanifest" }],
  }),
  component: () => (
    <GameProvider>
      <Room />
    </GameProvider>
  ),
});

function Progress() {
  const { isSolved, name } = useGame();
  return (
    <div className="sticky top-0 z-40 -mx-4 mb-8 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[10px] tracking-[0.35em] text-primary uppercase">
          Hollowmere · guest: {name || "unknown"}
        </span>
        <div className="flex gap-1.5">
          {STAGE_ORDER.map((s) => (
            <span
              key={s}
              title={STAGE_TITLES[s]}
              className={`h-1.5 w-7 rounded-full transition-colors ${
                isSolved(s) ? "bg-accent" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Notes() {
  const { notes } = useGame();
  if (!notes.length) return null;
  return (
    <aside className="rounded-lg border border-dashed border-border bg-card/40 p-5">
      <h3 className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
        what you know
      </h3>
      <ul className="mt-3 space-y-1.5">
        {notes.map((n) => (
          <li key={n} className="text-sm text-foreground/80">
            — {n}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Room() {
  const [entered, setEntered] = useState(false);
  const { dread, escaped } = useGame();

  if (!entered) return <NameGate onEnter={() => setEntered(true)} />;

  return (
    <div className="relative min-h-screen bg-background px-4 pb-32 text-foreground">
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
        style={{
          opacity: 0.15 + dread * 0.35,
          background: "radial-gradient(circle at 50% 0%, rgba(140,40,28,0.35), transparent 60%)",
        }}
      />
      <div className="film-grain pointer-events-none fixed inset-0 z-0 animate-grain" />

      <div className="relative z-10">
        <Progress />
        <main className="mx-auto flex max-w-3xl flex-col gap-6">
          <header className="text-center">
            <h1 className="font-display text-3xl tracking-[0.15em] text-foreground uppercase">
              The Study Remembers You
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything is in this one room. It unlocks as the house decides you're ready.
            </p>
          </header>

          <Study />
          <Cctv />
          <Recording />
          <Torch />
          <Mirror />
          <Captcha />
          <Diary />
          <Door />
          <Notes />

          {escaped && (
            <p className="animate-fade-in text-center font-mono text-xs tracking-[0.3em] text-accent uppercase">
              — end —
            </p>
          )}
        </main>
      </div>

      <Phone />
    </div>
  );
}
