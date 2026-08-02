# hanziway (漢字道)

中文字典與輸入法練習應用程式。

I can read characters well enough as in if I don't know a meaning I can handwrite it on my phone to look it up. However, I've always wanted to be able to use those shape-based input methods that let you type blazingly fast instead of having to rely on pinyin or handwriting. Most existing resources were either unmaintained, incomplete, or just not built the way I needed so I built hanziway (漢字道). Currently it has a character dictionary and Cangjie/pinyin input practice, with more input methods to come.

## Features

**Dictionary**: Look up any character with a Mandarin reading or CC-CEDICT entry to see its readings across Mandarin, Cantonese, Japanese, Korean, and Vietnamese, plus definitions, stroke counts, variants, and compound words. Search by typing the character directly, or by pinyin pronunciation. One feature that I want to highlight is that every Chinese character in the lookup page can be tapped to direct to that character's page (even in compounds and definitions) so exploring a character's usage is literally a single tap away. This is notable since it's one of the pain points that I have in a dictionary that I frequently use on my phone.

**Input method practice**: I decided to use HSK and TOCFL word lists as a base to practice your preferred input method on. Cangjie and pinyin are both available, with pinyin practice offering a toggle for whether tone has to match exactly. So you can pick your HSK and/or TOCFL levels (multiple levels even) and work through those characters. For Cangjie, you can type with your physical keyboard or the on-screen keyboard.

**Offline support**: Installable as a PWA. The service worker precaches the app and dictionary data so it works without a connection after the first visit. Updates are opt-in: a new version stays in the background until you choose to refresh, there's also a short changelog that summarizes what's new.

## Some decisions that I want to highlight

**UX**: The guiding principle in my designing journey is always about the user experience. A notable concept is "switching context should never be necessary" which appears in a few places such as:

1. The Key References panel keeps the current practice character pinned in the sticky header, so even if it takes over the screen on mobile you never have to close it just to remind yourself which character you're working on.
2. On the dictionary side, every character that appears anywhere on the page (in a definition, a compound word, a reading) is tappable and goes straight to that character's own entry, so following a thread of curiosity through related characters doesn't require you to go back to the search box.

**Dictionary scope**: The full Unihan set is roughly 90,000 characters, most of which are archaic or extremely rare. The dictionary includes only characters that have a CC-CEDICT entry or a Unihan Mandarin reading, roughly 20,000 to 30,000, which covers practical everyday use without bloating the app.

**Flexible pinyin input**: Most people don't type tone marks, and even fewer know the ASCII substitute for ü. Pinyin search ignores tone by default, accepts either diacritics or a trailing tone digit (`ni3`), and accepts `v` in place of `ü` (`nv` matches `nǚ`) — so however you're used to typing pinyin, it should just work.

**Traditional and Simplified are treated as separate entries**: Merging them reliably is harder than it looks. Trad/Simp pairs are extracted character-by-character from CC-CEDICT entries wherever Traditional and Simplified forms differ, then cross-checked against Unihan's variant fields. This means 国 and 國 end up as separate entries with independent HSK and TOCFL levels, since those are derived from script-specific word lists so it's the same character but it's two different data profiles.

**Character levels are derived from word lists**: HSK and TOCFL only publish word-level data, not character-level data. Each character gets the level of the easiest word it appears in, per standard, excluding proper nouns.

**Custom on-screen keyboard for Cangjie**: Native text inputs on mobile trigger the OS keyboard which resizes the viewport unpredictably. Dealing with the messiness that is different IME standards is also frustrating and pretty out-of-scope for such a project too. Because of that, after several approaches, the fix I decided on was to remove the native input entirely and use a custom keyboard alongside a global keydown listener to share the same state, so you can type with a physical hardware keyboard or the on-screen one. Pinyin practice doesn't have this problem, since it's just Latin text, so it uses the normal input field.

**Update flow**: Browsers don't reliably check for a new service worker on their own, so without something explicit, a user could stay stuck on an old version forever. Instead of relying on that, or forcing an update onto someone mid-session, the app shows a prompt once a new version is actually ready and waits for the user to click refresh.

**Transparency**: hanziway has no backend, no accounts, and no tracking beyond Vercel's infrastructure-level analytics. There's a [privacy page](https://hanziway.vercel.app/privacy) that you can check out the privacy policy in detail, and a [licenses page](https://hanziway.vercel.app/licenses) attributing third-party data source used.

## Stack

- Next.js, React, TypeScript, Tailwind CSS, deployed on Vercel
- Python for the data pipeline: `build_dictionary.py` parses the Unicode Unihan Database's raw text files and CC-CEDICT, cross-references HSK/TOCFL word lists for level data, and produces `dictionary.json`, served statically in `public/`. Cangjie input codes come from Unihan's `kCangjie` field.
- HanziWriter for stroke animation; pinyin-zhuyin, wanakana, and hangul-romanization for reading conversions

## Data & licensing

| Source                                  | Used for                                                           | License            |
| --------------------------------------- | ------------------------------------------------------------------ | ------------------ |
| Unicode Unihan Database                 | Character readings, stroke counts, Cangjie codes, variant mappings | Unicode License v3 |
| CC-CEDICT                               | Definitions, pinyin, compound words                                | CC BY-SA 4.0       |
| 倉頡輸入法/輔助字形 (Chinese Wikibooks) | Cangjie key reference text                                         | CC BY-SA 4.0       |
| Cangjie6 (Wikimedia Commons)            | Auxiliary shape SVGs                                               | CC0 1.0            |

Full attribution and license terms at [hanziway.vercel.app/licenses](https://hanziway.vercel.app/licenses). Privacy policy at [hanziway.vercel.app/privacy](https://hanziway.vercel.app/privacy).
