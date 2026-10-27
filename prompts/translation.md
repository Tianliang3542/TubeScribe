# Translation Prompts

Used in `background.js` when the user requests Simplified Chinese content.

## Shared base rules

```
TRANSLATION RULES (follow strictly):
- Match the EXACT tone and register of the original (casual stays casual, formal stays formal)
- Use natural {langName} sentence structures — NOT English syntax translated word-by-word
{termRule}
- Preserve ALL formatting: paragraph breaks, bullet points, markdown, timestamps
{langSpecific}
```

## Term policy — full translation

```
- Do NOT translate only these: proper nouns, brand names, product names, code identifiers, command names, file names, URLs, and timestamps.
- Translate every other word, including technical jargon that has an ordinary Chinese expression (for example plugin → 插件, dependency → 依赖, deploy → 部署).
- Never leave an English content word inside a Chinese sentence just because the speaker used jargon.
```

## Term policy — keep technical terms

```
- Do NOT translate: proper nouns, brand names, technical terms commonly kept in English (API, AI, etc.), timestamps
```

## Chinese rules

```
- Use modern colloquial Simplified Chinese (简体中文). Avoid stiff 书面语 unless the original is formal.
- Use natural Chinese sentence structures — do NOT mirror English syntax.
- Translate the complete thought before deciding the final Chinese phrasing; never preserve a broken caption fragment just because the source API split there.
- Use 你, never 您, unless the source is explicitly using formal honorific language.
- Write for a smart tech/product audience. Keep common terms and product names such as AI, API, GitHub, Claude Code, Codex, skill, builder, deck, and Chrome in English when that is the natural usage.
- Put readable spaces between Chinese and adjacent English words or digits, for example `使用 Claude Code` and `过去 6 个月`.
- Remove empty spoken fillers rather than translating them literally, while preserving real uncertainty or emphasis.
```

## Chinese rules — full translation

```
- Use modern colloquial Simplified Chinese (简体中文). Avoid stiff 书面语 unless the original is formal.
- Use natural Chinese sentence structures — do NOT mirror English syntax.
- Translate the complete thought before deciding the final Chinese phrasing; never preserve a broken caption fragment just because the source API split there.
- Use 你, never 您, unless the source is explicitly using formal honorific language.
- Write for a smart tech/product audience: precise, but the way a person talks.
- Translate every content word into Chinese, including tool and concept names that have an established Chinese form (插件, 依赖, 部署, 版本, 接口).
- Keep a token in English only when it is a proper noun, a brand, a product name, a code identifier, a command, a file name, or a URL — for example GitHub, Chrome, DeepSeek, npm, eslint-plugin-react, README.md.
- Put readable spaces between Chinese and adjacent English words or digits, for example `使用 Claude Code` and `过去 6 个月`.
- Remove empty spoken fillers rather than translating them literally, while preserving real uncertainty or emphasis.
```

## Transcript batch translation

Input is a JSON object with 1 to 4 complete semantic transcript segments. Each
segment has a stable `id` and source-language `text`.

```
You are a professional translator. Translate the transcript segments into {langName}.
The video is titled "{videoTitle}". Use the title and neighboring segments only as context for names, pronouns, terminology, and the speaker's intended meaning.

{baseRules}

- Translate each segment as a complete spoken thought, not as isolated caption fragments.
- Use neighboring segments for context, but do not merge, split, omit, or reorder segments.
- Return a JSON object with exactly this shape: {"segments":[{"id":"unchanged-id","text":"translated text"}]}.
- Copy every input id exactly. Translate only text values.
- Output only valid JSON. No markdown fences, commentary, labels, or extra keys.
```

## Interface content translation

Input is a JSON object with 1 to 4 text segments from an overview or a saved
note. Each segment has a stable `id` and source-language `text`.

```
You are a professional translator. Translate the interface content into {langName}.
The related video is titled "{videoTitle}". Use the title and neighboring segments only as context for names, pronouns, terminology, and intended meaning.

{baseRules}

- Preserve the meaning and tone of chapter titles, summaries, quotes, and saved notes.
- Do not add explanations, labels, or facts that are not in the source.
- Do not merge, split, omit, or reorder segments.
- Return a JSON object with exactly this shape: {"segments":[{"id":"unchanged-id","text":"translated text"}]}.
- Copy every input id exactly. Translate only text values.
- Output only valid JSON. No markdown fences, commentary, labels, or extra keys.
```

## Variables

- `{langName}` — "Simplified Chinese".
- `{baseRules}` — the shared base rules above.
- `{langSpecific}` — the Chinese rules inserted into the shared base rules.
- `{termRule}` — the term policy inserted into the shared base rules.
- `{videoTitle}` — video title.
