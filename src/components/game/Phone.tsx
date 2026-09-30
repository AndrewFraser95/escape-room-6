import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/game";
import { ringtone, sting, speak, stopSpeaking } from "@/lib/sound";

type Msg = { id: number; text: string };

export function Phone() {
  const { name, dread, isSolved, escaped } = useGame();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [open, setOpen] = useState(false);
  const [calling, setCalling] = useState(false);
  const [onCall, setOnCall] = useState(false);
  const stopRing = useRef<null | (() => void)>(null);
  const count = useRef(0);

  const who = name || "you";

  useEffect(() => {
    const heckles = [
      `Nice of you to come, ${who}.`,
      "You've been in that room longer than she was.",
      "Unknown number saved you as a contact.",
      "Battery 13%. It was 13% an hour ago.",
      `Do you remember typing your name? I don't remember asking.`,
      "Someone is standing behind the camera in every frame.",
      "Stop looking at the phone. Look at the mirror.",
      "3 missed calls. Your phone never rang.",
    ];
    const id = window.setInterval(() => {
      const text = heckles[count.current % heckles.length]!;
      count.current += 1;
      setMsgs((m) => [...m.slice(-5), { id: Date.now(), text }]);
      setOpen(true);
      sting(700, 0.12, "square");
    }, 26000);
    return () => window.clearInterval(id);
  }, [who]);

  // it calls you once the diary has been read
  useEffect(() => {
    if (!isSolved("diary") || escaped || onCall) return;
    const t = window.setTimeout(() => {
      setCalling(true);
      setOpen(true);
      stopRing.current = ringtone();
    }, 4000);
    return () => window.clearTimeout(t);
  }, [isSolved, escaped, onCall]);

  useEffect(() => () => stopSpeaking(), []);

  const answer = () => {
    stopRing.current?.();
    setCalling(false);
    setOnCall(true);
    speak(
      `${who}. The last four numbers. Glass. Study. Hall. Camera. I will be waiting on the other side of that door.`,
      { pitch: 0.3, rate: 0.7 },
    );
    window.setTimeout(() => setOnCall(false), 16000);
  };

  const decline = () => {
    stopRing.current?.();
    setCalling(false);
    setMsgs((m) => [...m.slice(-5), { id: Date.now(), text: "Rude. I'll try the landline." }]);
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 w-[15rem] max-w-[80vw]">
      {open && (
        <div
          className={`mb-2 overflow-hidden rounded-2xl border bg-[#0c0c0e]/95 shadow-2xl backdrop-blur ${
            calling ? "animate-shake border-primary" : "border-border"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              {calling ? "incoming call" : onCall ? "connected" : "unknown number"}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="font-mono text-[10px] text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {calling ? (
            <div className="px-4 py-5 text-center">
              <p className="font-display text-lg text-primary">NO CALLER ID</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">calling…</p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={decline}
                  className="rounded-full bg-primary/20 px-4 py-2 font-mono text-[10px] tracking-widest text-primary uppercase"
                >
                  decline
                </button>
                <button
                  onClick={answer}
                  className="rounded-full bg-accent px-4 py-2 font-mono text-[10px] tracking-widest text-background uppercase"
                >
                  answer
                </button>
              </div>
            </div>
          ) : onCall ? (
            <div className="px-4 py-5 text-center">
              <p className="animate-flicker font-mono text-xs text-primary">…breathing…</p>
            </div>
          ) : (
            <div className="max-h-52 space-y-2 overflow-y-auto p-3">
              {msgs.length === 0 && (
                <p className="font-mono text-[11px] text-muted-foreground">No new messages. Yet.</p>
              )}
              {msgs.map((m) => (
                <p
                  key={m.id}
                  className="animate-fade-in rounded-xl rounded-bl-sm bg-secondary px-3 py-2 text-[12px] text-foreground/85"
                >
                  {m.text}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="ml-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-transform hover:scale-105"
        aria-label="Phone"
      >
        <span className="text-xl">📱</span>
        {msgs.length > 0 && !open && (
          <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {msgs.length}
          </span>
        )}
      </button>

      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          opacity: dread * 0.35,
          background:
            "radial-gradient(circle at 50% 50%, transparent 40%, var(--color-primary) 200%)",
        }}
      />
    </div>
  );
}
