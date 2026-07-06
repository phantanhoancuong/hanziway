"use client";

import { useEffect, useState } from "react";

import hangulRomanization from "hangul-romanization";
import { pinyinToZhuyin } from "pinyin-zhuyin";
import { toHiragana, toKatakana } from "wanakana";

import {
  CharacterWriter,
  ClickableCharacters,
  Section,
} from "@/components/client";
import { Icon } from "@/components/server";
import {
  CJK_RE,
  LETTER_TO_KEY,
  CharacterEntry,
  cn,
  lookupCharacter,
  searchByPinyin,
} from "@/lib";
import { SearchIcon } from "@/assets";

type SearchMode = "character" | "pinyin";

const GRID_COLS = { base: 4, sm: 6, lg: 8 };
const ROWS_PER_PAGE = 3;
const PAGE_SIZE = GRID_COLS.lg * ROWS_PER_PAGE;
const PAGE_SLOTS = 7;

/**
 * Build a page list with ellipsis gaps e.g. [0, "…", 3, 4, 5, "…", 27].
 * @param current - Current page (0-indexed).
 * @param total - Total number of pages.
 * @returns Page numbers (0-indexed) and "…" placeholders, in display order.
 */
const getPageList = (current: number, total: number): (number | "…")[] => {
  const edgeCount = PAGE_SLOTS - 2;
  if (total <= PAGE_SLOTS) {
    return Array.from({ length: total }, (_, i) => i);
  }

  if (current <= edgeCount - 1) {
    return [...Array.from({ length: edgeCount }, (_, i) => i), "…", total - 1];
  }

  if (current >= total - edgeCount) {
    return [
      0,
      "…",
      ...Array.from({ length: edgeCount }, (_, i) => total - edgeCount + i),
    ];
  }

  return [0, "…", current - 1, current, current + 1, "…", total - 1];
};

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [query, setQuery] = useState<Map<string, string> | null>(null);
  const [entry, setEntry] = useState<CharacterEntry | null | undefined>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>("character");
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    if (selectedChar === null) return setEntry(null);
    lookupCharacter(selectedChar).then((r) => setEntry(r ?? undefined));
  }, [selectedChar, query]);

  /**
   * Commit the current input as a searchable query.
   *
   * Normalize submitted text before lookup so downstream logic only operates on supported characters.
   *
   * @param e - Form submission event.
   */
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const handleCharacterSearch = async () => {
      const filtered = [...trimmed]
        .filter((char) => CJK_RE.test(char))
        .join("");
      if (!filtered) return;

      const uniqueChars = [...new Set(filtered)];
      const entries = await Promise.all(
        uniqueChars.map((char) => lookupCharacter(char))
      );

      setInputText("");
      setQuery(
        new Map(uniqueChars.map((char, i) => [char, entries[i]?.r[0]?.m ?? ""]))
      );
      setSelectedChar(uniqueChars[0] ?? null);
      setPage(0);
    };

    const handlePinyinSearch = async () => {
      const words = trimmed.split(" ");
      if (!words) return;

      const resultsPerWord = await Promise.all(
        words.map((word) => searchByPinyin(word))
      );
      const flatResults = resultsPerWord.flat();

      setInputText("");
      setQuery(
        new Map(flatResults.map((r) => [r.char, r.entry.r[0]?.m ?? ""]))
      );
      setSelectedChar(flatResults[0]?.char ?? null);
      setPage(0);
    };

    switch (searchMode) {
      case "character":
        await handleCharacterSearch();
        break;
      case "pinyin":
        await handlePinyinSearch();
        break;
    }
  };

  /**
   * Look up a character clicked anywhere on the page.
   *
   * @param character - The CJK character that was clicked.
   */
  const handleCharacterClick = async (character: string) =>
    setSelectedChar(character);

  const characters = query ? [...query.keys()] : [];

  const totalPages = Math.ceil(characters.length / PAGE_SIZE);
  const pageChars = characters.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-2 p-6">
      <form className="flex" onSubmit={handleSubmit}>
        <input
          className="bg-elevated border-border placeholder:text-foreground/40 text-foreground focus:border-accent hover:border-foreground/40 flex-1 cursor-text rounded-l-2xl border border-r-0 p-2 pl-4 transition-colors outline-none"
          type="text"
          value={inputText}
          placeholder={
            searchMode === "character"
              ? "Look up characters . . ."
              : "Look up pinyin . . ."
          }
          onChange={(e) => setInputText(e.target.value)}
        />

        <button className="bg-elevated border-border hover:bg-foreground/5 cursor-pointer rounded-r-2xl border px-4 transition-colors">
          <Icon src={SearchIcon} />
        </button>
      </form>
      <div className="inline-grid grid-cols-2 gap-2 self-start">
        <button
          className={cn(
            "bg-elevated border-border w-24 cursor-pointer rounded-sm border px-3 py-1 text-xs transition-all outline-none",
            searchMode === "character"
              ? "border-accent text-accent"
              : "text-foreground/40 hover:text-foreground hover:border-foreground/40"
          )}
          onClick={() => setSearchMode("character")}
        >
          Character
        </button>
        <button
          className={cn(
            "bg-elevated border-border w-24 cursor-pointer rounded-sm border px-3 py-1 text-xs transition-all outline-none",
            searchMode === "pinyin"
              ? "border-accent text-accent"
              : "text-foreground/40 hover:text-foreground hover:border-foreground/40"
          )}
          onClick={() => setSearchMode("pinyin")}
        >
          Pinyin
        </button>
      </div>

      {query !== null && characters.length === 0 && (
        <p className="text-foreground/40 mt-1 text-sm lg:mt-2">
          No entries found
        </p>
      )}

      {characters.length > 0 && (
        <div className="mt-1 lg:mt-2">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {Array.from({ length: PAGE_SIZE }, (_, index) => {
              const character = pageChars[index];
              if (!character)
                return <div className="h-14" key={index} aria-hidden />;

              return (
                <button
                  className={cn(
                    "bg-elevated flex h-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm border text-lg transition-all outline-none",
                    selectedChar === character
                      ? "border-accent text-accent cursor-default"
                      : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
                  )}
                  key={index}
                  onClick={() => setSelectedChar(character)}
                >
                  <span>{character}</span>
                  {query?.get(character) && (
                    <span className="text-xs">{query.get(character)}</span>
                  )}
                </button>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-2 flex justify-center">
              <div className="flex min-w-[16rem] items-center justify-center gap-1">
                <button
                  className="text-foreground/40 hover:text-foreground cursor-pointer px-2 py-1 text-xs transition-colors disabled:cursor-default disabled:opacity-30"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </button>
                {getPageList(page, totalPages).map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="text-foreground/40 flex h-7 w-7 items-center justify-center text-xs"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={cn(
                        "h-7 w-7 cursor-pointer rounded-sm text-xs transition-colors",
                        page === p
                          ? "bg-accent text-background"
                          : "text-foreground/40 hover:text-foreground"
                      )}
                      onClick={() => setPage(p)}
                    >
                      {p + 1}
                    </button>
                  )
                )}
                <button
                  className="text-foreground/40 hover:text-foreground cursor-pointer px-2 py-1 text-xs transition-colors disabled:cursor-default disabled:opacity-30"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {entry !== null && selectedChar && (
        <div className="flex w-full flex-col gap-6 pt-10">
          {entry !== undefined ? (
            <>
              <div
                className="grid items-start gap-6"
                style={{ gridTemplateColumns: "50% 50%" }}
              >
                <div className="flex flex-col gap-2">
                  <CharacterWriter character={selectedChar} />

                  {entry.var && entry.var.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground/40 text-xs font-semibold tracking-wider uppercase">
                        {entry.var.length === 1 ? "Variant" : "Variants"}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {entry.var.map((varChar, i) => (
                          <button
                            key={i}
                            className="bg-elevated border-border text-foreground/40 hover:text-foreground hover:border-foreground/40 aspect-square w-1/3 cursor-pointer rounded-lg border text-4xl transition-all outline-none sm:w-1/4"
                            onClick={() => handleCharacterClick(varChar)}
                          >
                            {varChar}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  {(entry.sc || (entry.r && entry.r.length > 0)) && (
                    <div className="flex flex-col gap-8">
                      <Section
                        label="General"
                        className="grid-cols-1 sm:grid-cols-2"
                      >
                        <div>
                          <div className="text-foreground/40 text-xs">
                            Strokes
                          </div>
                          <div className="text-sm">{entry.sc ?? "—"}</div>
                        </div>
                        <div>
                          <div className="text-foreground/40 text-xs">
                            Mandarin
                          </div>
                          <div className="text-sm">
                            {[
                              ...new Set(
                                entry.r!.filter((r) => r.m).map((r) => r.m)
                              ),
                            ].map((m, i) => (
                              <div key={i}>
                                {m} ({pinyinToZhuyin(m!)})
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-foreground/40 text-xs">
                            Cangjie
                          </div>
                          <div className="text-sm">
                            {entry.cj
                              ? `${entry.cj.toUpperCase()} (${entry.cj
                                  .toUpperCase()
                                  .split("")
                                  .map((c) => LETTER_TO_KEY.get(c)?.radical)
                                  .join("")})`
                              : "—"}
                          </div>
                        </div>
                      </Section>

                      <Section
                        label="Other languages"
                        className="grid-cols-1 sm:grid-cols-2"
                      >
                        <div>
                          <div className="text-foreground/40 text-xs">
                            Cantonese
                          </div>
                          <div className="text-sm">{entry.c ?? "—"}</div>
                        </div>
                        <div>
                          <div className="text-foreground/40 text-xs">
                            Hanja
                          </div>
                          <div className="text-sm">
                            {entry.k
                              ? `${entry.k} (${hangulRomanization.convert(entry.k)})`
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-foreground/40 text-xs">
                            On'yomi
                          </div>
                          <div className="flex flex-col text-sm">
                            {entry.on
                              ? entry.on.split(" ").map((r, i) => (
                                  <span key={i}>
                                    {toKatakana(r)} ({r})
                                  </span>
                                ))
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-foreground/40 text-xs">
                            Kun'yomi
                          </div>
                          <div className="flex flex-col text-sm">
                            {entry.kun
                              ? entry.kun.split(" ").map((r, i) => (
                                  <span key={i}>
                                    {toHiragana(r)} ({r})
                                  </span>
                                ))
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-foreground/40 text-xs">
                            Hán Việt
                          </div>
                          <div className="text-sm">{entry.v ?? "—"}</div>
                        </div>
                      </Section>
                    </div>
                  )}
                </div>
              </div>

              {entry.r && entry.r.length > 0 && (
                <Section label={entry.r.length > 1 ? "Meanings" : "Meaning"}>
                  <div className="flex flex-col gap-2">
                    {entry.r.map((reading, i) => (
                      <div
                        key={i}
                        className="border-foreground/10 flex flex-col gap-2 rounded-sm border-2 p-3"
                      >
                        {reading.m && (
                          <div className="flex items-baseline gap-3">
                            <span className="text-base font-medium">
                              {reading.m}
                            </span>
                            <span className="text-foreground/60 text-sm">
                              ({pinyinToZhuyin(reading.m)})
                            </span>
                          </div>
                        )}

                        {reading.d && reading.d.length > 0 && (
                          <ol className="flex list-none flex-col gap-1">
                            {reading.d.map((def, j) => (
                              <li className="flex gap-2 text-sm sm:text-base">
                                {reading.d!.length > 1 && (
                                  <span className="w-6 shrink-0 text-right font-mono text-sm opacity-40">
                                    {j + 1}.
                                  </span>
                                )}
                                <span className="min-w-0 flex-1">
                                  <ClickableCharacters
                                    text={def}
                                    test={(char) => CJK_RE.test(char)}
                                    onCharacterClick={handleCharacterClick}
                                  />
                                </span>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {entry.cp && entry.cp.length > 0 && (
                <Section label="Compounds">
                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                    {entry.cp.map(([word, pinyin, definition], index) => (
                      <div
                        className="border-foreground/20 rounded-sm border-2 p-3"
                        key={index}
                      >
                        <div className="text-xl font-bold">
                          <ClickableCharacters
                            text={word}
                            test={(char) => CJK_RE.test(char)}
                            onCharacterClick={handleCharacterClick}
                          />
                        </div>
                        <div className="text-foreground/60 text-xs">
                          {pinyin}
                        </div>
                        <div className="text-sm">
                          <ClickableCharacters
                            text={definition}
                            test={(char) => CJK_RE.test(char)}
                            onCharacterClick={handleCharacterClick}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          ) : (
            <p className="text-foreground/40 text-sm">No entry found</p>
          )}
        </div>
      )}
    </div>
  );
}
