import { createContext, useContext, useCallback, useMemo, useState, type ReactNode } from "react";

export type StageId =
  "study" | "cctv" | "recording" | "torch" | "mirror" | "captcha" | "diary" | "door";

export const STAGE_ORDER: StageId[] = [
  "study",
  "cctv",
  "recording",
  "torch",
  "mirror",
  "captcha",
  "diary",
  "door",
];

export const STAGE_TITLES: Record<StageId, string> = {
  study: "I. The Study",
  cctv: "II. Camera 03",
  recording: "III. The Tape",
  torch: "IV. The Dark Hall",
  mirror: "V. The Glass",
  captcha: "VI. Prove You Are Human",
  diary: "VII. Her Diary",
  door: "VIII. The Door",
};

/** Digit each puzzle yields. Final code is these read in the tape's order. */
export const FINAL_CODE = "9742";

type GameValue = {
  name: string;
  setName: (n: string) => void;
  solved: Record<string, boolean>;
  solve: (id: StageId) => void;
  isSolved: (id: StageId) => boolean;
  isUnlocked: (id: StageId) => boolean;
  notes: string[];
  addNote: (n: string) => void;
  escaped: boolean;
  setEscaped: (v: boolean) => void;
  dread: number;
};

const GameContext = createContext<GameValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState("");
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<string[]>([]);
  const [escaped, setEscaped] = useState(false);

  const addNote = useCallback((n: string) => {
    setNotes((prev) => (prev.includes(n) ? prev : [...prev, n]));
  }, []);

  const solve = useCallback((id: StageId) => {
    setSolved((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  const isSolved = useCallback((id: StageId) => Boolean(solved[id]), [solved]);

  const isUnlocked = useCallback(
    (id: StageId) => {
      const idx = STAGE_ORDER.indexOf(id);
      if (idx <= 0) return true;
      return Boolean(solved[STAGE_ORDER[idx - 1]!]);
    },
    [solved],
  );

  const dread = useMemo(
    () => STAGE_ORDER.filter((s) => solved[s]).length / STAGE_ORDER.length,
    [solved],
  );

  const value = useMemo(
    () => ({
      name,
      setName,
      solved,
      solve,
      isSolved,
      isUnlocked,
      notes,
      addNote,
      escaped,
      setEscaped,
      dread,
    }),
    [name, solved, solve, isSolved, isUnlocked, notes, addNote, escaped, dread],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
