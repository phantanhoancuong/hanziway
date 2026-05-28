"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import hangulRomanization from "hangul-romanization";
import { pinyinToZhuyin } from "pinyin-zhuyin";
import { toHiragana, toKatakana } from "wanakana";

import { CharacterWriter } from "@/components/clients";
import { CharacterEntry, lookupCharacter } from "@/lib";

const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold opacity-40 uppercase tracking-wider">
      {label}
    </span>
    <div className="flex flex-col gap-0.5">{children}</div>
  </div>
);

const CollapsibleSection = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-semibold opacity-40 uppercase tracking-wider cursor-pointer hover:opacity-70 transition-opacity w-fit"
      >
        <span>{open ? "▼" : "▶"}</span>
        <span>{label}</span>
      </button>
      {open && <div className="flex flex-col gap-0.5">{children}</div>}
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <p className="text-sm">
    <span className="opacity-60">{label}</span> {value}
  </p>
);

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

  useEffect(() => {
    console.log(entry);
  }, [entry]);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const filtered = [...inputText.trim()].filter(isCJK).join("");
    if (!filtered) return;
    setQuery(filtered);
    setInputText("");
    setSelectedIndex(0);
  };

  const isCJK = (char: string): boolean => {
    const code = char.codePointAt(0) ?? 0;
    return (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3400 && code <= 0x4dbf) ||
      (code >= 0x20000 && code <= 0x2a6df) ||
      (code >= 0xf900 && code <= 0xfaff)
    );
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
                {(entry.strokeCount || entry.definition) && (
                  <Section label="General">
                    {entry.strokeCount && (
                      <Row label="Strokes" value={entry.strokeCount} />
                    )}
                    {entry.definition && (
                      <Row label="Definition" value={entry.definition} />
                    )}
                  </Section>
                )}

                {entry.mandarin && (
                  <Section label="Pronunciation">
                    <Row label="Pinyin" value={entry.mandarin} />
                    <Row
                      label="Zhuyin"
                      value={pinyinToZhuyin(entry.mandarin)}
                    />
                  </Section>
                )}

                {(entry.cantonese ||
                  entry.on ||
                  entry.kun ||
                  entry.korean ||
                  entry.vietnamese) && (
                  <CollapsibleSection label="Other languages">
                    {entry.cantonese && (
                      <Row label="Cantonese" value={entry.cantonese} />
                    )}

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

                    {entry.korean && (
                      <Row
                        label="Hanja"
                        value={
                          <Readings
                            value={entry.korean}
                            convert={(r) => hangulRomanization.convert(r)}
                          />
                        }
                      />
                    )}

                    {entry.vietnamese && (
                      <Row label="Vietnamese" value={entry.vietnamese} />
                    )}
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
