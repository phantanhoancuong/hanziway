"use client";

import { useEffect, useState } from "react";

import {
  CharacterDetail,
  ResultGrid,
  SearchModeToggle,
} from "@/components/client";
import { Icon } from "@/components/server";

import { CJK_RE, CharacterEntry, lookupCharacter, searchByPinyin } from "@/lib";

import { SearchMode } from "@/types";

import { SearchIcon } from "@/assets";

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

      <SearchModeToggle mode={searchMode} onChange={setSearchMode} />

      {query !== null && characters.length === 0 && (
        <p className="text-foreground/40 mt-1 text-sm lg:mt-2">
          No entries found
        </p>
      )}

      <ResultGrid
        characters={characters}
        captions={query ?? new Map()}
        selectedChar={selectedChar}
        onSelect={setSelectedChar}
        page={page}
        onPageChange={setPage}
      />

      {entry !== null && selectedChar && (
        <div className="flex w-full flex-col gap-6 pt-10">
          <CharacterDetail
            character={selectedChar}
            entry={entry}
            onCharacterClick={handleCharacterClick}
          />
        </div>
      )}
    </div>
  );
}
