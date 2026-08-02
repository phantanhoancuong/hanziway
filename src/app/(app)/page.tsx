"use client";
import { useEffect, useRef, useState } from "react";
import {
  CharacterDetail,
  ResultGrid,
  SearchModeToggle,
} from "@/components/client";
import { Icon } from "@/components/server";
import {
  CJK_RE,
  CharacterEntry,
  cn,
  lookupCharacter,
  searchByPinyin,
} from "@/lib";
import { SearchMode } from "@/types";
import { SearchIcon } from "@/assets";
export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [query, setQuery] = useState<Map<string, string> | null>(null);
  const [entry, setEntry] = useState<CharacterEntry | null | undefined>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>("character");
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectedChar === null) return setEntry(null);
    lookupCharacter(selectedChar).then((r) => setEntry(r ?? undefined));
  }, [selectedChar, query]);
  /** * Commit the current input as a searchable query. * * Normalize submitted text before lookup so downstream logic only operates on supported characters. * * @param e - Form submission event. */ const handleSubmit =
    async (e: React.SubmitEvent) => {
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
          new Map(
            uniqueChars.map((char, i) => [char, entries[i]?.r[0]?.m ?? ""])
          )
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
  /** * Look up a character clicked anywhere on the page. * * @param character - The CJK character that was clicked. */ const handleCharacterClick =
    async (character: string) => setSelectedChar(character);
  const characters = query ? [...query.keys()] : [];
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-2 p-3 sm:p-6">
      {" "}
      <form
        className="bg-elevated border-border focus-within:border-accent focus-within:ring-accent/15 [&:hover:not(:focus-within)]:border-foreground/30 flex items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-4 transition-all duration-350 focus-within:ring-4"
        onSubmit={handleSubmit}
      >
        {" "}
        <div
          className="relative flex h-full min-w-0 flex-1 cursor-text items-center"
          onClick={() => inputRef.current?.focus()}
        >
          {" "}
          <input
            ref={inputRef}
            className="text-foreground h-full w-full cursor-text bg-transparent outline-none"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />{" "}
          {!inputText && (
            <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
              {" "}
              <span
                className={cn(
                  "text-foreground/60 absolute transition-opacity duration-350",
                  searchMode === "character" ? "opacity-100" : "opacity-0"
                )}
              >
                {" "}
                Look up characters . . .{" "}
              </span>{" "}
              <span
                className={cn(
                  "text-foreground/60 absolute transition-opacity duration-350",
                  searchMode === "pinyin" ? "opacity-100" : "opacity-0"
                )}
              >
                {" "}
                Look up pinyin . . .{" "}
              </span>{" "}
            </div>
          )}{" "}
        </div>{" "}
        <button
          type="submit"
          aria-label="Search"
          className="bg-accent text-background focus-visible:ring-accent focus-visible:ring-offset-background flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-100 outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-90"
        >
          {" "}
          <Icon src={SearchIcon} />{" "}
        </button>{" "}
      </form>{" "}
      <SearchModeToggle mode={searchMode} onChange={setSearchMode} />{" "}
      {query !== null && characters.length === 0 && (
        <p className="text-foreground/60 mt-1 text-sm lg:mt-2">
          {" "}
          No entries found{" "}
        </p>
      )}{" "}
      <ResultGrid
        characters={characters}
        captions={query ?? new Map()}
        selectedChar={selectedChar}
        onSelect={setSelectedChar}
        page={page}
        onPageChange={setPage}
      />{" "}
      {entry !== null && selectedChar && (
        <div className="flex w-full flex-col gap-6 pt-10">
          {" "}
          <CharacterDetail
            character={selectedChar}
            entry={entry}
            onCharacterClick={handleCharacterClick}
          />{" "}
        </div>
      )}{" "}
    </div>
  );
}
