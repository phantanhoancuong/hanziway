"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";

import {
  CharacterDetail,
  CompoundDetail,
  ResultGrid,
  SearchModeToggle,
} from "@/components/client";
import { Icon } from "@/components/server";

import {
  CharacterEntry,
  CJK_RE,
  cn,
  CompoundMatch,
  lookupCharacter,
  lookupWord,
  searchByPinyin,
  searchByWord,
} from "@/lib";

import { SearchMode } from "@/types";

import { CopyIcon, SearchIcon, ShareIcon } from "@/assets";

/** Whether the given selection is a multi-character compound rather than a single character. */
const isCompound = (selection: string | null): boolean =>
  selection !== null && [...selection].length > 1;

/**
 * Truncate `text` to at most `max` characters for display, appending an ellipsis if anything was cut.
 *
 * @param text - Text to truncate.
 * @param max - Maximum characters to keep. Default to 12.
 * @returns The truncated text.
 */
const truncateForDisplay = (text: string, max: number = 12): string => {
  const chars = [...text];
  return chars.length > max ? chars.slice(0, max).join("") + "…" : text;
};

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Map<string, string> | null>(null);
  const [detail, setDetail] = useState<
    CharacterEntry | CompoundMatch | null | undefined
  >(null);
  const [mode, setMode] = useState<SearchMode>("character");
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [copyFailed, setCopyFailed] = useState<boolean>(false);
  const [canNativeShare, setCanNativeShare] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHydrated = useRef(false);

  const [resultView, setResultView] = useState<"word" | "char">("word");
  const [searchedQuery, setSearchedQuery] = useState<string>("");
  // True when "word" auto-downgraded to "char".
  const [autoFellBack, setAutoFellBack] = useState<boolean>(false);

  /**
   * Writer `mode`/`query`/`char`/`view` to the URL when a search runs or mode changes.
   *
   * @param searchMode - Current search mode.
   * @param searchQuery - Current search text, or "" if none.
   * @param char - Currently selected character or compound, or `null` if none.
   * @param push - Add a new history entry instead of replacing the current one.
   * Use for a new search or mode switch that had an active search currently, omit (replace) otherwise.
   * @param view - Which result type is being displayed "word" or "char".
   */
  const syncUrl = (
    searchMode: SearchMode,
    searchQuery: string,
    char: string | null,
    push: boolean = false,
    view?: "word" | "char"
  ): void => {
    const params = new URLSearchParams();
    params.set("mode", searchMode);
    if (searchQuery) params.set("query", searchQuery);
    if (char) params.set("char", char);
    if (view) params.set("view", view);
    if (push) router.push(`?${params.toString()}`, { scroll: false });
    else router.replace(`?${params.toString()}`, { scroll: false });
  };

  /**
   * Look up each unique character in `text` individually then populate `results` and select the first character.
   *
   * @param text - Raw text to search, filtered down to CJK characters.
   * @returns The characters found, in order.
   */
  const runIndividualCharacterSearch = async (
    text: string
  ): Promise<string[]> => {
    const filtered = [...text].filter((char) => CJK_RE.test(char)).join("");
    if (!filtered) {
      setResults(new Map());
      setSelectedChar(null);
      setPage(0);
      return [];
    }

    const uniqueChars = [...new Set(filtered)];
    const entries = await Promise.all(
      uniqueChars.map((char) => lookupCharacter(char))
    );
    setResults(
      new Map(uniqueChars.map((char, i) => [char, entries[i]?.r[0]?.m ?? ""]))
    );
    setSelectedChar(uniqueChars[0] ?? null);
    setPage(0);
    return uniqueChars;
  };

  /**
   * Run a character or compound search for `text`, populate `results`, and select the first result.
   *
   * If `text` is a single character is looked up directly.
   * If `text` is two or more characters search for compounds containing that sequence first;
   * if none exists, fall back to looking up each character individually.
   *
   * @param text - Raw text to search, filtered down to CJK characters.
   * @returns The characters or compound words found, in order.
   */
  const runCharacterSearch = async (text: string): Promise<string[]> => {
    const filtered = [...text].filter((char) => CJK_RE.test(char)).join("");
    if (!filtered) {
      setResultView("word");
      setAutoFellBack(false);
      setResults(new Map());
      setSelectedChar(null);
      setPage(0);
      return [];
    }

    const chars = [...filtered];
    if (chars.length === 1) {
      setResultView("word");
      setAutoFellBack(false);
      const entry = await lookupCharacter(filtered);
      setResults(new Map([[filtered, entry?.r[0]?.m ?? ""]]));
      setSelectedChar(filtered);
      setPage(0);
      return [filtered];
    }

    const matches = await searchByWord(filtered);
    setSearchedQuery(filtered);
    if (matches.length > 0) {
      setResultView("word");
      setAutoFellBack(false);
      setResults(new Map(matches.map((m) => [m.word, m.pinyin])));
      const words = matches.map((m) => m.word);
      setSelectedChar(words[0] ?? null);
      setPage(0);
      return words;
    }

    setResultView("char");
    setAutoFellBack(true);
    return runIndividualCharacterSearch(filtered);
  };

  /** Switch between compound and individual character results for the current query, without re-running the search from the URL. */
  const handleToggleResultView = async (): Promise<void> => {
    if (resultView === "word") {
      setResultView("char");
      const foundChars = await runIndividualCharacterSearch(query);
      if (hasHydrated.current) {
        syncUrl(mode, query, foundChars[0] ?? null, false, "char");
      }
    } else {
      const matches = await searchByWord(query);
      setResultView("word");
      setAutoFellBack(false);
      setResults(new Map(matches.map((m) => [m.word, m.pinyin])));
      setSelectedChar(matches[0]?.word ?? null);
      setPage(0);
      if (hasHydrated.current) {
        syncUrl(mode, query, matches[0]?.word ?? null, false, "word");
      }
    }
  };

  /**
   * Run a pinyin search for `text`, populate `results`, and select the first result.
   *
   * @param text - Raw pinyin text to search, space separated per syllable/word.
   * @returns The characters found, in order.
   */
  const runPinyinSearch = async (text: string): Promise<string[]> => {
    const trimmed = text.trim();
    const words = trimmed.split(" ").filter(Boolean);
    if (words.length === 0) {
      setResults(new Map());
      setSelectedChar(null);
      setPage(0);
      return [];
    }

    const resultsPerWord = await Promise.all(
      words.map((word) => searchByPinyin(word))
    );
    const flatResults = resultsPerWord.flat();
    setResults(
      new Map(flatResults.map((r) => [r.char, r.entry.r[0]?.m ?? ""]))
    );
    const chars = flatResults.map((r) => r.char);
    setSelectedChar(chars[0] ?? null);
    setPage(0);
    return chars;
  };

  /** On mount, restore mode/query/char from the URL and run the search. */
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    const mode: SearchMode = modeParam === "pinyin" ? "pinyin" : "character";
    setMode(mode);

    const queryParam = searchParams.get("query");
    const charParam = searchParams.get("char");
    const viewParam = searchParams.get("view");

    if (queryParam) {
      setQuery(queryParam);

      const run = async (): Promise<string[]> => {
        if (mode === "pinyin") return runPinyinSearch(queryParam);

        if (viewParam === "char") {
          setResultView("char");
          setAutoFellBack(false);
          return runIndividualCharacterSearch(queryParam);
        }
        return runCharacterSearch(queryParam);
      };

      run()
        .then((foundChars) => {
          const isValidCharParam =
            charParam !== null &&
            charParam.length > 0 &&
            [...charParam].every((c) => CJK_RE.test(c));
          if (isValidCharParam) setSelectedChar(charParam);
          else if (foundChars.length === 0) setSelectedChar(null);
        })
        .finally(() => {
          hasHydrated.current = true;
        });
    } else {
      hasHydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanNativeShare(true);
    }
  }, []);

  useEffect(() => {
    if (selectedChar === null) return setDetail(null);

    const lookup = isCompound(selectedChar)
      ? lookupWord(selectedChar)
      : lookupCharacter(selectedChar);
    lookup.then((r) => setDetail(r ?? undefined));
  }, [selectedChar, results]);

  /**
   * Handle search mode switching.
   *
   * Flag the resulting URL update as needs pushing only if a query was already active.
   *
   * @param mode - The search mode to switch to.
   */
  const handleSearchModeChange = (mode: SearchMode) => {
    const hadResults = results !== null;
    setMode(mode);
    setSelectedChar(null);
    setResults(null);
    setResultView("word");
    setAutoFellBack(false);
    if (!hasHydrated.current) return;
    syncUrl(mode, "", null, hadResults);
  };

  /**
   * Commit the current input as a query.
   *
   * Flag the resulting URL update as needs pushing only if a query was already active.
   *
   * @param e - Form submission event.
   */
  const handleSubmit = async (e: React.SubmitEvent): Promise<void> => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const hadResults = results !== null;
    const foundChars =
      mode === "pinyin"
        ? await runPinyinSearch(trimmed)
        : await runCharacterSearch(trimmed);

    if (hasHydrated.current) {
      syncUrl(
        mode,
        trimmed,
        foundChars[0] ?? null,
        hadResults,
        mode === "character" ? resultView : undefined
      );
    }
  };

  /** Clear the input text and give it focus. */
  const handleClearInput = (): void => {
    setQuery("");
    inputRef.current?.focus();
  };

  /** Share the current search's URL via the native share on device. */
  const handleShare = async (): Promise<void> => {
    try {
      await navigator.share({ url: window.location.href });
    } catch {
      // User cancelled.
    }
  };

  /** Copy the current search's URL to the clipboard. */
  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setCopyFailed(false);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 1500);
    }
  };

  /**
   * Select a character or compound and replace the URL.
   *
   * @param selection - The character or compound word that was selected.
   */
  const handleSelectChar = (selection: string): void => {
    setSelectedChar(selection);
    if (hasHydrated.current) syncUrl(mode, query, selection);
  };

  const characters = results ? [...results.keys()] : [];
  const isMultiCharSearch = mode === "character" && [...query].length > 1;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-2 p-3 sm:p-6">
      <form
        className="bg-elevated border-border focus-within:border-accent focus-within:ring-accent/15 [&:hover:not(:focus-within)]:border-foreground/30 flex items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-4 transition-all duration-350 focus-within:ring-4"
        onSubmit={handleSubmit}
      >
        <div
          className="relative flex h-full min-w-0 flex-1 cursor-text items-center"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            className="text-foreground h-full w-full cursor-text bg-transparent outline-none"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {!query && (
            <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
              <span
                className={cn(
                  "text-foreground/60 absolute transition-opacity duration-350",
                  mode === "character" ? "opacity-100" : "opacity-0"
                )}
              >
                Look up characters or words . . .
              </span>
              <span
                className={cn(
                  "text-foreground/60 absolute transition-opacity duration-350",
                  mode === "pinyin" ? "opacity-100" : "opacity-0"
                )}
              >
                Look up pinyin . . .
              </span>
            </div>
          )}
        </div>

        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClearInput}
            className="text-foreground/60 hover:text-foreground focus-visible:ring-accent flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2"
          >
            ✕
          </button>
        )}

        <button
          type="submit"
          aria-label="Search"
          className="bg-accent text-background focus-visible:ring-accent focus-visible:ring-offset-background flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-100 outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-90"
        >
          <Icon src={SearchIcon} />
        </button>
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchModeToggle mode={mode} onChange={handleSearchModeChange} />

        {results !== null && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {canNativeShare && (
              <button
                type="button"
                aria-label="Share this search"
                onClick={handleShare}
                className="text-foreground/60 hover:text-foreground focus-visible:ring-accent bg-elevated border-border hover:border-foreground/30 flex h-9 w-24 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-2 sm:w-32"
              >
                <span className="flex size-5 shrink-0 items-center justify-center">
                  <Icon src={ShareIcon} />
                </span>
                <span className="flex-1 text-center">Share</span>
              </button>
            )}

            <button
              type="button"
              aria-label="Copy link to this search"
              onClick={handleCopyLink}
              className="text-foreground/60 hover:text-foreground focus-visible:ring-accent bg-elevated border-border hover:border-foreground/30 flex h-9 w-24 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-2 sm:w-32"
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <Icon src={CopyIcon} />
              </span>
              <span className="flex-1 text-center sm:hidden">
                {shareCopied ? "Copied!" : copyFailed ? "Failed" : "Copy"}
              </span>
              <span className="hidden flex-1 text-center sm:inline">
                {shareCopied ? "Copied!" : copyFailed ? "No copy" : "Copy link"}
              </span>
            </button>
          </div>
        )}
      </div>

      {results !== null && isMultiCharSearch && (
        <div className="mt-1 flex flex-col gap-1 text-sm lg:mt-2">
          {autoFellBack && characters.length > 0 && (
            <p className="text-foreground/60">
              No compound found for &ldquo;{truncateForDisplay(searchedQuery)}
              &rdquo; — showing each character instead.
            </p>
          )}
          {characters.length === 0 && (
            <p className="text-foreground/60">No entries found</p>
          )}
          {resultView === "word" && characters.length > 0 && (
            <button
              type="button"
              onClick={handleToggleResultView}
              className="text-accent hover:text-accent/80 w-fit cursor-pointer text-left underline underline-offset-2"
            >
              Search each character instead
            </button>
          )}
          {resultView === "char" && !autoFellBack && (
            <button
              type="button"
              onClick={handleToggleResultView}
              className="text-accent hover:text-accent/80 w-fit cursor-pointer text-left underline underline-offset-2"
            >
              Search as a compound word instead
            </button>
          )}
        </div>
      )}

      {results !== null && !isMultiCharSearch && characters.length === 0 && (
        <p className="text-foreground/60 mt-1 text-sm lg:mt-2">
          No entries found
        </p>
      )}

      <ResultGrid
        characters={characters}
        captions={results ?? new Map()}
        selectedChar={selectedChar}
        onSelect={handleSelectChar}
        page={page}
        onPageChange={setPage}
      />

      {detail !== null && selectedChar && (
        <div className="flex w-full flex-col gap-6 pt-10">
          {isCompound(selectedChar) ? (
            <CompoundDetail
              word={selectedChar}
              match={detail as CompoundMatch | undefined}
              onCharacterClick={handleSelectChar}
            />
          ) : (
            <CharacterDetail
              character={selectedChar}
              entry={detail as CharacterEntry | undefined}
              onCharacterClick={handleSelectChar}
            />
          )}
        </div>
      )}
    </div>
  );
}
