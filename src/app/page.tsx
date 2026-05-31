"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import hangulRomanization from "hangul-romanization";
import { pinyinToZhuyin } from "pinyin-zhuyin";
import { toHiragana, toKatakana } from "wanakana";

import {
  CharacterWriter,
  ClickableCharacters,
  CollapsibleSection,
  Row,
  Section,
} from "@/components/clients";
import { CJK_RE, CharacterEntry, lookupCharacter } from "@/lib";

/**
 * Render transformed readings alongside their original forms.
 *
 * This is often used in the format of `original scripts (romanized scripts)`.
 *
 * @param props.value - Space-delimited source readings.
 * @param props.convert - Convert an individual reading into a target script.
 */
const Readings = ({
  value,
  convert,
}: {
  value: string;
  convert: (reading: string) => string;
}) => (
  <>
    {value.split(" ").map((reading, i, arr) => (
      <span key={i}>
        {convert(reading)} ({reading}){i < arr.length - 1 ? " | " : ""}
      </span>
    ))}
  </>
);

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

  const variantChar = entry?.s ?? entry?.t;
  const variantLabel = entry?.s
    ? "Simplified"
    : entry?.t
      ? "Traditional"
      : undefined;

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
                <div className="grid grid-cols-2 gap-6 items-start">
                  <div className="flex flex-col gap-2">
                    <CharacterWriter character={displayedCharacter} />
                    <div
                      className={`flex flex-col items-start gap-1 w-1/3 sm:w-1/4 transition-opacity ${
                        variantChar
                          ? "opacity-60 hover:opacity-100 cursor-pointer"
                          : "invisible"
                      }`}
                      onClick={() =>
                        variantChar && handleCharacterClick(variantChar)
                      }
                    >
                      <span className="text-xs">
                        {variantLabel ?? "\u00A0"}
                      </span>
                      <div className="w-full aspect-square">
                        {variantChar && (
                          <CharacterWriter
                            character={variantChar}
                            isLoop={false}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 flex-1">
                    {(entry?.sc || entry?.d) && (
                      <Section label="General">
                        {entry?.sc && <Row label="Strokes" value={entry.sc} />}
                        {entry?.d && (
                          <Row
                            label="Definition"
                            value={
                              <ClickableCharacters
                                text={entry.d}
                                test={(char) => CJK_RE.test(char)}
                                onCharacterClick={handleCharacterClick}
                              />
                            }
                          />
                        )}
                      </Section>
                    )}

                    {entry?.m && (
                      <Section label="Pronunciation">
                        <Row label="Pinyin" value={entry.m} />
                        <Row label="Zhuyin" value={pinyinToZhuyin(entry.m)} />
                      </Section>
                    )}

                    <CollapsibleSection label="Other languages">
                      <Row label="Cantonese" value={entry?.c ?? "—"} />
                      <Row
                        label="Onyomi"
                        value={
                          entry?.on ? (
                            <Readings
                              value={entry.on}
                              convert={(r) => toKatakana(r)}
                            />
                          ) : (
                            "—"
                          )
                        }
                      />
                      <Row
                        label="Kunyomi"
                        value={
                          entry?.kun ? (
                            <Readings
                              value={entry.kun}
                              convert={(r) => toHiragana(r)}
                            />
                          ) : (
                            "—"
                          )
                        }
                      />
                      <Row
                        label="Hanja"
                        value={
                          entry?.k ? (
                            <Readings
                              value={entry.k}
                              convert={(r) => hangulRomanization.convert(r)}
                            />
                          ) : (
                            "—"
                          )
                        }
                      />
                      <Row label="Vietnamese" value={entry?.v ?? "—"} />
                    </CollapsibleSection>
                  </div>
                </div>

                {entry.cp && entry.cp.length > 0 && (
                  <CollapsibleSection label="Compounds">
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
                  </CollapsibleSection>
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
