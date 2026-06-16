"use client";

import { useState, useRef, useEffect } from "react";
import { pinyinToZhuyin } from "pinyin-zhuyin";
import { cn, getCharactersByLevel } from "@/lib";

const SESSION_SIZE = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type PracticeChar = {
  char: string;
  cj: string;
  pinyin: string;
  definition: string;
  typed?: string;
  correct?: boolean;
};

const HSK_LEVELS = [
  { n: 1, label: "HSK 1" },
  { n: 2, label: "HSK 2" },
  { n: 3, label: "HSK 3" },
  { n: 4, label: "HSK 4" },
  { n: 5, label: "HSK 5" },
  { n: 6, label: "HSK 6" },
  { n: 7, label: "HSK 7 – 9" },
];

const TOCFL_LEVELS = [
  { n: 1, label: "Novice 1" },
  { n: 2, label: "Novice 2" },
  { n: 3, label: "Intermediate 1" },
  { n: 4, label: "Intermediate 2" },
  { n: 5, label: "Advanced 1" },
  { n: 6, label: "Advanced 2" },
];

export default function PracticePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"select" | "practice" | "result">(
    "select"
  );
  const [session, setSession] = useState<PracticeChar[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [inputText, setInputText] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputShake, setInputShake] = useState<boolean>(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (inputShake) return;
    if (inputText.trim().length == 0) {
      setInputShake(true);
      setTimeout(() => setInputShake(false), 500);
      return;
    }
    const current = session[index];
    const typed = inputText.trim();
    const correct = typed === current.cj;

    setSession((prev) =>
      prev.map(
        (c, i): PracticeChar => (i === index ? { ...c, typed, correct } : c)
      )
    );

    setInputText("");

    if (index + 1 >= session.length) {
      setPhase("result");
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  const lastSelectedSize = useRef(0);
  if (selected.size > 0) lastSelectedSize.current = selected.size;

  const handleStart = async () => {
    const hskLevels = [...selected]
      .filter((id) => id.startsWith("hsk:"))
      .map((id) => parseInt(id.slice(4)));
    const tocflLevels = [...selected]
      .filter((id) => id.startsWith("tocfl:"))
      .map((id) => parseInt(id.slice(6)));

    const all = await getCharactersByLevel(hskLevels, tocflLevels);

    const chars: PracticeChar[] = shuffle(all)
      .slice(0, SESSION_SIZE)
      .filter((s) => s.entry.cj && s.entry.r?.[0]?.m)
      .map((s) => ({
        char: s.char,
        cj: s.entry.cj!,
        pinyin: s.entry.r![0].m!,
        definition: s.entry.r![0].d?.[0] ?? "",
      }));

    setSession(chars);
    setIndex(0);
    setPhase("practice");
  };

  useEffect(() => {
    if (phase === "practice") inputRef.current?.focus();
  }, [phase]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-6">
      {phase === "select" ? (
        <>
          <div>
            <h1>Cangjie Practice</h1>
            <p>Type the Cangjie code for each character</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-foreground/40 text-sm font-semibold tracking-wider uppercase">
                HSK
              </span>
              <div className="grid grid-cols-3 gap-2">
                {HSK_LEVELS.map((level) => {
                  const id = `hsk:${level.n}`;
                  return (
                    <button
                      className={cn(
                        "bg-elevated h-12 cursor-pointer rounded-sm border text-sm transition-all outline-none",
                        level.n === 7 && "col-span-3",
                        selected.has(id)
                          ? "border-accent text-accent"
                          : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
                      )}
                      key={id}
                      onClick={() => toggle(id)}
                    >
                      {level.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-foreground/40 text-sm font-semibold tracking-wider uppercase">
                TOCFL
              </span>
              <div className="grid grid-cols-2 gap-2">
                {TOCFL_LEVELS.map((level) => {
                  const id = `tocfl:${level.n}`;
                  return (
                    <button
                      className={cn(
                        "bg-elevated h-12 cursor-pointer rounded-sm border text-sm transition-all outline-none",
                        selected.has(id)
                          ? "border-accent text-accent"
                          : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
                      )}
                      key={id}
                      onClick={() => toggle(id)}
                    >
                      {level.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            className={cn(
              "bg-elevated border-border hover:bg-foreground/5 hover:border-accent hover:text-accent h-12 cursor-pointer rounded-sm border px-4 transition-all",
              selected.size > 0
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            )}
            onClick={handleStart}
          >
            Start — {lastSelectedSize.current} level
            {lastSelectedSize.current === 1 ? "" : "s"} selected
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="border-foreground/10 flex min-h-64 w-full flex-col items-center justify-center gap-4 rounded-sm border-2 p-6">
            <span className="text-8xl leading-none font-light">
              {session[index].char}
            </span>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-baseline gap-3">
                <span className="text-base font-medium">
                  {session[index].pinyin}
                </span>
                <span className="text-foreground/60 text-sm">
                  ({pinyinToZhuyin(session[index].pinyin)})
                </span>
              </div>
              <div className="text-foreground/60 text-sm">
                {session[index].definition}
              </div>
            </div>
          </div>

          <form
            className={cn(
              "border-border flex w-full",
              inputShake && "animate-shake"
            )}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input
              className="bg-elevated border-border placeholder:text-foreground/40 text-foreground focus:border-accent hover:border-foreground/40 w-full min-w-50 flex-1 cursor-text rounded-l-2xl border border-r-0 p-2 pl-4 transition-colors outline-none"
              value={inputText}
              placeholder="Type Cangjie . . ."
              autoFocus={true}
              onChange={(e) => setInputText(e.target.value.toUpperCase())}
              ref={inputRef}
            />

            <button
              className="bg-elevated border-border hover:bg-foreground/5 cursor-pointer rounded-r-2xl border px-4 transition-colors"
              onMouseDown={(e) => e.preventDefault()}
            >
              Enter
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
