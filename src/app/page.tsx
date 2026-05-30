"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import hangulRomanization from "hangul-romanization";
import { pinyinToZhuyin } from "pinyin-zhuyin";
import { toHiragana, toKatakana } from "wanakana";

import {
  CharacterWriter,
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
  const [entry, setEntry] = useState<CharacterEntry | null>(null);

  useEffect(() => {
    if (selectedIndex === null || !query) {
      setEntry(null);
      return;
    }
    const character = query[selectedIndex];
    lookupCharacter(character).then(setEntry);
  }, [selectedIndex]);

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
                onClick={() => {
                  setSelectedIndex(index);
                }}
              >
                {character}
              </button>
            ))}
          </div>
        )}

        {selectedIndex !== null && (
          <div className="flex gap-6 items-start">
            <div className="relative shrink-0">
              <CharacterWriter character={characters[selectedIndex]} />
              <div className="absolute inset-0 border-2 border-red-500 pointer-events-none" />
            </div>

            {entry ? (
              <div className="flex flex-col gap-4">
                {(entry.sc || entry.d) && (
                  <Section label="General">
                    {entry.sc && <Row label="Strokes" value={entry.sc} />}
                    {entry.d && <Row label="Definition" value={entry.d} />}
                  </Section>
                )}

                {entry.m && (
                  <Section label="Pronunciation">
                    <Row label="Pinyin" value={entry.m} />
                    <Row label="Zhuyin" value={pinyinToZhuyin(entry.m)} />
                  </Section>
                )}

                {(entry.c || entry.on || entry.kun || entry.k || entry.v) && (
                  <CollapsibleSection label="Other languages">
                    {entry.c && <Row label="Cantonese" value={entry.c} />}

                    {entry.on && (
                      <Row
                        label="Onyomi"
                        value={
                          <Readings
                            value={entry.on}
                            convert={(r) => toKatakana(r)}
                          />
                        }
                      />
                    )}

                    {entry.kun && (
                      <Row
                        label="Kunyomi"
                        value={
                          <Readings
                            value={entry.kun}
                            convert={(r) => toHiragana(r)}
                          />
                        }
                      />
                    )}

                    {entry.k && (
                      <Row
                        label="Hanja"
                        value={
                          <Readings
                            value={entry.k}
                            convert={(r) => hangulRomanization.convert(r)}
                          />
                        }
                      />
                    )}

                    {entry.v && <Row label="Vietnamese" value={entry.v} />}
                  </CollapsibleSection>
                )}

                {entry.cp && entry.cp.length > 0 && (
                  <CollapsibleSection label="Compounds">
                    {entry.cp.map((compound, i) => {
                      const [word, ...rest] = compound;
                      const simp = rest.length === 3 ? rest[0] : null;
                      const pinyin = rest.length === 3 ? rest[1] : rest[0];
                      const definition = rest.length === 3 ? rest[2] : rest[1];
                      return (
                        <Row
                          key={i}
                          label={simp ? `${word} / ${simp}` : word}
                          value={`${pinyin} — ${definition}`}
                        />
                      );
                    })}
                  </CollapsibleSection>
                )}
              </div>
            ) : (
              <p className="text-sm opacity-40">No entry found</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
