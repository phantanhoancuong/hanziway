import { CONTACT_EMAIL } from "@/app/constants";

export default function LicensesPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-2 p-6 text-justify">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Licenses &amp; Credits</h1>
        <p className="text-foreground/60 text-sm">
          The dictionary and reference content for hanziway incorporates data
          and assets from the projects listed below. License notices and
          attribution information are provided in accordance with their
          respective terms.
        </p>
      </div>

      <div className="flex flex-col gap-6 pt-6">
        <div className="border-foreground/10 flex flex-col gap-2 rounded-sm border-2 p-4">
          <h3 className="text-foreground/40 text-base font-semibold tracking-wider uppercase">
            Unihan Database
          </h3>
          <p className="text-sm">
            Character readings, definitions, and other character properties are
            derived from the Unicode Unihan Database, published by the Unicode
            Consortium.
          </p>
          <p className="text-foreground/60 text-sm">
            Copyright © 2021–2026 Unicode, Inc. Used under the terms of the{" "}
            <a
              href="https://github.com/unicode-org/unihan-database/blob/main/LICENSE"
              className="text-foreground/60 underline underline-offset-2"
            >
              Unicode License v3
            </a>{" "}
            (SPDX: Unicode-3.0). Unicode, Inc. provides the data "as is",
            without warranty of any kind.
          </p>
        </div>

        <div className="border-foreground/10 flex flex-col gap-2 rounded-sm border-2 p-4">
          <h3 className="text-foreground/40 text-base font-semibold tracking-wider uppercase">
            CC-CEDICT
          </h3>
          <p className="text-sm">
            Word and compound definitions, and most character readings, are
            derived from{" "}
            <a
              href="https://www.mdbg.net/chinese/dictionary?page=cc-cedict"
              className="text-accent underline underline-offset-2"
            >
              CC-CEDICT
            </a>
            , copyright © its maintainers, with portions from the original
            CEDICT database copyright © 1997–1998 Paul Andrew Denisowski. Hosted
            and distributed by{" "}
            <a
              href="https://www.mdbg.net"
              className="text-accent underline underline-offset-2"
            >
              MDBG
            </a>
            .
          </p>
          <p className="text-foreground/60 text-sm">
            This work is licensed under the{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              className="text-foreground/60 underline underline-offset-2"
            >
              Creative Commons Attribution-ShareAlike 4.0 International License
            </a>
            . The data has been reformatted and adapted for use within hanziway.
            No warranty is provided.
          </p>
        </div>

        <div className="border-foreground/10 flex flex-col gap-2 rounded-sm border-2 p-4">
          <h3 className="text-foreground/40 text-base font-semibold tracking-wider uppercase">
            Cangjie Reference
          </h3>
          <p className="text-sm">
            Cangjie key descriptions and character decomposition examples are
            adapted from{" "}
            <a
              href="https://zh.wikibooks.org/zh-tw/%E5%80%89%E9%A0%A1%E8%BC%B8%E5%85%A5%E6%B3%95/%E8%BC%94%E5%8A%A9%E5%AD%97%E5%BD%A2"
              className="text-accent underline underline-offset-2"
            >
              倉頡輸入法/輔助字形 (Cangjie Input Method/Auxiliary Glyphs)
            </a>
            , a Chinese Wikibooks article, copyright © its contributors.
          </p>
          <p className="text-foreground/60 text-sm">
            Text from this source is licensed under the{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              className="text-foreground/60 underline underline-offset-2"
            >
              Creative Commons Attribution-ShareAlike 4.0 International License
            </a>
            . The content has been adapted and reformatted for use within
            hanziway. No warranty is provided.
          </p>
          <p className="text-sm">
            Auxiliary-shape glyph SVG images are sourced from{" "}
            <a
              href="https://commons.wikimedia.org/wiki/User:Cangjie6"
              className="text-accent underline underline-offset-2"
            >
              Cangjie6 on Wikimedia Commons
            </a>{" "}
            and dedicated to the public domain under the{" "}
            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/"
              className="text-foreground/60 underline underline-offset-2"
            >
              CC0 1.0 Universal Public Domain Dedication
            </a>
            .
          </p>
        </div>

        <div className="border-foreground/10 flex flex-col gap-2 rounded-sm border-2 p-4">
          <h3 className="text-foreground/40 text-base font-semibold tracking-wider uppercase">
            Contact
          </h3>
          <p className="text-sm">
            For questions about licensing, attribution, or to report a concern
            regarding the use of third-party content, contact me at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-accent underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
