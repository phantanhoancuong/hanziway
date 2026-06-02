"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import hangulRomanization from "hangul-romanization";
import { pinyinToZhuyin } from "pinyin-zhuyin";
import { toHiragana, toKatakana } from "wanakana";

import {
  CharacterWriter,
  ClickableCharacters,
  Section,
} from "@/components/clients";
import { CJK_RE, CharacterEntry, lookupCharacter } from "@/lib";

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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between h-20 px-6">
        <Link href="/" className="cursor-pointer">
          <div className="flex flex-col">
            <span className="text-3xl font-bold tracking-tight text-red-500">
              hanziway
            </span>
            <span className="text-sm text-red-500">漢字道</span>
          </div>
        </Link>
      </header>

      <main className="flex flex-col flex-1 gap-6 p-6 max-w-2xl mx-auto w-full">
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input
            className="flex-1 p-2 border-2 border-foreground/20 rounded-sm bg-transparent focus:border-foreground/60 outline-none transition-colors"
            type="text"
            value={inputText}
            placeholder="Type or paste characters"
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            className="px-4 border-2 border-foreground/20 rounded-sm cursor-pointer hover:border-foreground/60 transition-colors"
            type="submit"
          >
            Search
          </button>
        </form>

        {characters.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {characters.map((character, index) => (
              <button
                className={`size-12 border-2 rounded-sm cursor-pointer text-xl transition-all ${
                  selectedIndex === index
                    ? "border-red-500 text-red-500"
                    : "border-foreground/20 opacity-40 hover:opacity-100"
                }`}
                key={index}
                onClick={() => setSelectedIndex(index)}
              >
                {character}
              </button>
            ))}
          </div>
        )}

        {entry !== null && (
          <div className="flex flex-col gap-6 w-full">
            {entry !== undefined ? (
              <>
                <div
                  className="grid gap-6 items-start"
                  style={{ gridTemplateColumns: "50% 50%" }}
                >
                  <div className="flex flex-col gap-2">
                    <CharacterWriter character={displayedCharacter} />

                    {entry.var && entry.var.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold opacity-40 uppercase tracking-wider">
                          {entry.var.length === 1 ? "Variant" : "Variants"}
                        </span>
                        <div className="flex gap-2 flex-wrap">
                          {entry.var.map((varChar, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-start gap-1 w-1/3 sm:w-1/4 opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
                              onClick={() => handleCharacterClick(varChar)}
                            >
                              <div className="w-full aspect-square">
                                <CharacterWriter
                                  character={varChar}
                                  isLoop={false}
                                  highlight={false}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!entry.var || entry.var.length === 0) && (
                      <div className="invisible flex flex-col items-start gap-1 w-1/3 sm:w-1/4">
                        <span className="text-xs">{"\u00A0"}</span>
                        <div className="w-full aspect-square" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    {(entry.sc || (entry.r && entry.r.length > 0)) && (
                      <div className="flex flex-col gap-8">
                        <Section label="GENERAL" colCount={2}>
                          <div>
                            <div className="text-xs opacity-40">Strokes</div>
                            <div className="text-sm">{entry.sc ?? "-"}</div>
                          </div>
                          <div>
                            <div className="text-xs opacity-40">Mandarin</div>
                            <div className="text-sm">
                              {(() => {
                                const readings = [
                                  ...new Set(
                                    entry.r!.map((reading) => reading.m),
                                  ),
                                ];

                                return readings.length > 0 ? (
                                  readings.map((m, i) => (
                                    <div key={i}>
                                      {m} ({pinyinToZhuyin(m!)})
                                    </div>
                                  ))
                                ) : (
                                  <div>-</div>
                                );
                              })()}
                            </div>
                          </div>
                        </Section>

                        <Section label="OTHER LANGUAGES" colCount={2}>
                          <div>
                            <div className="text-xs opacity-40">Cantonese</div>
                            <div className="text-sm">{entry.c ?? "-"}</div>
                          </div>
                          <div>
                            <div className="text-xs opacity-40">Hanja</div>
                            <div className="text-sm">
                              {entry.k
                                ? `${entry.k} (${hangulRomanization.convert(entry.k)})`
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs opacity-40">On'yomi</div>
                            <div className="text-sm flex flex-col">
                              {entry.on
                                ? entry.on.split(" ").map((r, i) => (
                                    <span key={i}>
                                      {toKatakana(r)} ({r})
                                    </span>
                                  ))
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs opacity-40">Kun'yomi</div>
                            <div className="text-sm flex flex-col">
                              {entry.kun
                                ? entry.kun.split(" ").map((r, i) => (
                                    <span key={i}>
                                      {toHiragana(r)} ({r})
                                    </span>
                                  ))
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs opacity-40">Han-Viet</div>
                            <div className="text-sm">{entry.v ?? "-"}</div>
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
                          className="flex flex-col gap-2 p-3 border-2 border-foreground/10 rounded-sm"
                        >
                          {reading.m && (
                            <div className="flex items-baseline gap-3">
                              <span className="text-base font-medium">
                                {reading.m}
                              </span>
                              <span className="text-sm">
                                ({pinyinToZhuyin(reading.m)})
                              </span>
                            </div>
                          )}

                          {reading.d && reading.d.length > 0 && (
                            <ol className="flex flex-col gap-1 list-none">
                              {reading.d.map((def, j) => (
                                <li key={j} className="text-sm">
                                  {reading.d!.length > 1 && (
                                    <span className="opacity-40 mr-1">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      {entry.cp.map(([word, pinyin, definition], index) => (
                        <div
                          className="border-2 p-3 border-foreground/20 rounded-sm"
                          key={index}
                        >
                          <div className="text-sm font-bold">
                            <ClickableCharacters
                              text={word}
                              test={(char) => CJK_RE.test(char)}
                              onCharacterClick={handleCharacterClick}
                            />
                          </div>
                          <div className="text-xs opacity-60">{pinyin}</div>
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
              <p className="text-sm opacity-40">No entry found</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
