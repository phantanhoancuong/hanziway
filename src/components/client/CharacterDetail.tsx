"use client";

import hangulRomanization from "hangul-romanization";
import { pinyinToZhuyin } from "pinyin-zhuyin";
import { toHiragana, toKatakana } from "wanakana";

import {
  CharacterWriter,
  ClickableCharacters,
  Section,
} from "@/components/client";
import { CJK_RE, LETTER_TO_KEY, CharacterEntry } from "@/lib";

export default function CharacterDetail({
  character,
  entry,
  onCharacterClick,
}: {
  character: string;
  entry: CharacterEntry | undefined;
  onCharacterClick: (character: string) => void;
}) {
  if (!entry) {
    return <p className="text-foreground/40 text-sm">No entry found</p>;
  }

  return (
    <>
      <div
        className="grid items-start gap-6"
        style={{ gridTemplateColumns: "50% 50%" }}
      >
        <div className="flex flex-col gap-2">
          <CharacterWriter character={character} />

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
                    onClick={() => onCharacterClick(varChar)}
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
              <Section label="General" className="grid-cols-1 sm:grid-cols-2">
                <div>
                  <div className="text-foreground/40 text-xs">Strokes</div>
                  <div className="text-sm">{entry.sc ?? "—"}</div>
                </div>
                <div>
                  <div className="text-foreground/40 text-xs">Mandarin</div>
                  <div className="text-sm">
                    {[
                      ...new Set(entry.r!.filter((r) => r.m).map((r) => r.m)),
                    ].map((m, i) => (
                      <div key={i}>
                        {m} ({pinyinToZhuyin(m!)})
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-foreground/40 text-xs">Cangjie</div>
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
                  <div className="text-foreground/40 text-xs">Cantonese</div>
                  <div className="text-sm">{entry.c ?? "—"}</div>
                </div>
                <div>
                  <div className="text-foreground/40 text-xs">Hanja</div>
                  <div className="text-sm">
                    {entry.k
                      ? `${entry.k} (${hangulRomanization.convert(entry.k)})`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-foreground/40 text-xs">On&apos;yomi</div>
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
                    Kun&apos;yomi
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
                  <div className="text-foreground/40 text-xs">Hán Việt</div>
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
                    <span className="text-base font-medium">{reading.m}</span>
                    <span className="text-foreground/60 text-sm">
                      ({pinyinToZhuyin(reading.m)})
                    </span>
                  </div>
                )}

                {reading.d && reading.d.length > 0 && (
                  <ol className="flex list-none flex-col gap-1">
                    {reading.d.map((def, j) => (
                      <li key={j} className="flex gap-2 text-sm sm:text-base">
                        {reading.d!.length > 1 && (
                          <span className="w-6 shrink-0 text-right font-mono text-sm opacity-40">
                            {j + 1}.
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <ClickableCharacters
                            text={def}
                            test={(char) => CJK_RE.test(char)}
                            onCharacterClick={onCharacterClick}
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
                    onCharacterClick={onCharacterClick}
                  />
                </div>
                <div className="text-foreground/60 text-xs">{pinyin}</div>
                <div className="text-sm">
                  <ClickableCharacters
                    text={definition}
                    test={(char) => CJK_RE.test(char)}
                    onCharacterClick={onCharacterClick}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
