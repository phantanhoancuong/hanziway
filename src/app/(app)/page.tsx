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
import { CJK_RE, CharacterEntry, cn, lookupCharacter } from "@/lib";
import { SearchIcon } from "@/assets";

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [displayedCharacter, setDisplayedCharacter] = useState<string>("");
  const [entry, setEntry] = useState<CharacterEntry | null | undefined>(null);

  useEffect(() => {
    if (selectedIndex === null || !query) {
      setEntry(null);
      return;
    }
    const character = query[selectedIndex];
    setDisplayedCharacter(character);
    lookupCharacter(character).then((r) => setEntry(r ?? undefined));
  }, [selectedIndex, query]);

  /**
   * Commit the current input as a searchable query.
   *
   * Normalize submitted text before lookup so downstream logic only operates on supported characters.
   *
   * @param e - Form submission event.
   */
  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const filtered = [...inputText.trim()]
      .filter((char) => CJK_RE.test(char))
      .join("");
    if (!filtered) return;
    setQuery(filtered);
    setInputText("");
    setSelectedIndex(0);
  };

  /**
   * Look up a character clicked anywhere on the page.
   *
   * Update the detail panel without affecting the query or selected index.
   *
   * @param character - The CJK character that was clicked.
   */
  const handleCharacterClick = async (character: string) => {
    setSelectedIndex(null);
    setDisplayedCharacter(character);
    const result = await lookupCharacter(character);
    setEntry(result ?? undefined);
  };

  const characters = query ? [...query] : [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-2 p-6">
      <form className="flex" onSubmit={handleSubmit}>
        <input
          className="bg-elevated border-border placeholder:text-foreground/40 text-foreground focus:border-accent hover:border-foreground/40 flex-1 cursor-text rounded-l-2xl border border-r-0 p-2 pl-4 transition-colors outline-none"
          type="text"
          value={inputText}
          placeholder="Look up characters . . ."
          onChange={(e) => setInputText(e.target.value)}
        />

        <button className="bg-elevated border-border hover:bg-foreground/5 cursor-pointer rounded-r-2xl border px-4 transition-colors">
          <Icon src={SearchIcon} />
        </button>
      </form>

      {characters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {characters.map((character, index) => (
            <button
              className={cn(
                "bg-elevated size-12 cursor-pointer rounded-sm border text-xl transition-all outline-none",
                selectedIndex === index
                  ? "border-accent text-accent cursor-default"
                  : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
              )}
              key={index}
              onClick={() => setSelectedIndex(index)}
            >
              {character}
            </button>
          ))}
        </div>
      )}
      {entry !== null && (
        <div className="flex w-full flex-col gap-6 pt-10">
          {entry !== undefined ? (
            <>
              <div
                className="grid items-start gap-6"
                style={{ gridTemplateColumns: "50% 50%" }}
              >
                <div className="flex flex-col gap-2">
                  <CharacterWriter character={displayedCharacter} />

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
                              <li
                                key={j}
                                className="flex gap-2 text-sm sm:text-base"
                              >
                                {reading.d!.length > 1 && (
                                  <span className="w-6 shrink-0 text-right font-mono text-sm opacity-40">
                                    {j + 1}.
                                  </span>
                                )}
                                <ClickableCharacters
                                  text={def}
                                  test={(char) => CJK_RE.test(char)}
                                  onCharacterClick={handleCharacterClick}
                                />
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
