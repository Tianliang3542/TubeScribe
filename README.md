# TubeScribe

[English](README.md) | [简体中文](README.zh-CN.md)

> **This fork.** TubeScribe starts from
> [zarazhangrui/youtube-digest](https://github.com/zarazhangrui/youtube-digest)
> and adds four things: the transcript follows video playback by itself, Chinese
> translation is complete by default, the interface switches between English and
> Simplified Chinese, and one click sends the transcript to Notion or GetNote.
> It also runs on Windows and macOS without bash. See [FORK.md](FORK.md) for
> what changed and why.

New here? **[INSTALL.md](INSTALL.md)** has a one-line install for Windows and
macOS, plus the exact folder path to paste into `chrome://extensions`. If you
would rather hand the install to an AI agent (Doubao, WorkBuddy, Codex, Claude),
copy the prompt in **[AGENT-INSTALL.md](AGENT-INSTALL.md)**.

Turn every YouTube video into a resource for deep learning. TubeScribe brings transcripts, bilingual translation, AI overviews, explanations, and timestamped notes into one Chrome side panel, so you can study ideas and language without losing your place.

- Turn captions into a readable, searchable learning resource.
- Learn languages with the original transcript, a Simplified Chinese translation, or an aligned bilingual view.
- Build understanding with an AI overview, chapters, key quotes, and selected-text explanations.
- Navigate long videos by clicking timestamps in the transcript, overview, or notes.
- Save polished timestamped notes for later study.
- Keep control of your data with your own API keys, local Chrome storage, and no analytics or telemetry.

TubeScribe is a bring-your-own-key project installed locally from GitHub. It is not available through the Chrome Web Store, does not include API credits, and does not run a developer-operated server.

![YouTube Digest demo](YouTube%20Digest%20demo.png)

## What this fork adds (v1.3.0)

- The transcript scrolls itself to follow video playback, and re-anchors after you switch language mode.
- Chinese translation is complete by default; one setting keeps technical terms in English instead.
- Switch the interface between English and Simplified Chinese.
- Send the transcript to Notion or GetNote with one click.
- Runs on Windows and macOS without bash: `npm test`, `npm run check` and `npm run package` all use Node only.

## Install (about 2 minutes)

No build step and no Chrome Web Store. You need [Git](https://git-scm.com/download) and [Node.js 20 or newer](https://nodejs.org). Node is only used by the self-check, the extension itself has no dependencies.

**Step 1: copy the project.** Decide where it should live permanently, then run one line.

Windows (PowerShell):

```powershell
git clone https://github.com/Tianliang3542/TubeScribe.git "$HOME\Documents\tube-scribe"; cd "$HOME\Documents\tube-scribe"; node scripts/doctor.mjs
```

macOS / Linux:

```bash
git clone https://github.com/Tianliang3542/TubeScribe.git ~/Documents/tube-scribe && cd ~/Documents/tube-scribe && node scripts/doctor.mjs
```

`doctor` ends by printing the exact folder path you need in step 2. If it prints any `[fail]`, fix that first.

**Step 2: load it in Chrome.**

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Paste the path doctor printed, then press Enter

Paste the path instead of clicking through folders; selecting a parent folder fails with "manifest file is missing". After this, never move or rename the folder; the extension breaks until you load it again.

**Step 3: add your two keys.** Click the TubeScribe icon, open **Settings**, and paste:

| Key | What it is for | Where to get it |
| --- | --- | --- |
| Supadata API key | fetching the transcript | [dash.supadata.ai](https://dash.supadata.ai/auth/sign-up) |
| DeepSeek API key | overview, translation, explanations | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |

Enter keys only in those two fields. Never put a key in a chat, a source file, or a screenshot.

**Step 4: first run.**

1. Open a normal video: `https://www.youtube.com/watch?v=...` (Shorts, live streams and members-only videos are not supported)
2. Click the TubeScribe icon and wait for the transcript to load in the side panel
3. Switch the top-right control to **双语 / Bilingual**; Chinese fills in line by line as you read
4. Click a timestamp to jump to that moment; select any line to explain it or save it as a timestamped note
5. Optional: click **Notion** or **GetNote** in the transcript toolbar to send it to your knowledge base, after filling in those credentials in Settings

**Prefer to let an agent do it?** Copy the prompt in **[AGENT-INSTALL.md](AGENT-INSTALL.md)**.
Longer walkthrough, updates and troubleshooting: **[INSTALL.md](INSTALL.md)**.

## Updating

```bash
cd <the folder you cloned>
git pull
```

Then open `chrome://extensions`, click **Reload** on the TubeScribe card, and refresh any open YouTube tab. An unpacked extension never updates by itself.


## Set up your API keys

TubeScribe needs two keys under your own provider accounts:

1. A **Supadata API key** to retrieve YouTube transcripts.
2. A **DeepSeek API key** for overviews, explanations, translation, and automatic note polishing.

### Get a Supadata API key

1. Open the official [Supadata sign-up page](https://dash.supadata.ai/auth/sign-up).
2. Create an account and complete the short onboarding flow.
3. Supadata generates an API key automatically during onboarding.
4. Open the [Supadata dashboard](https://dash.supadata.ai/) whenever you need to find or manage the key.
5. Copy the key and paste it into **Supadata API key** in TubeScribe Settings.

See the [official Supadata documentation](https://docs.supadata.ai/) if the dashboard flow changes.

### Get a DeepSeek API key

1. Open the official [DeepSeek API Keys page](https://platform.deepseek.com/api_keys).
2. Sign in or create a DeepSeek Platform account when prompted.
3. Choose **Create new API key**, give it a recognizable name such as `TubeScribe`, and create it.
4. Copy the key immediately. The full key may only be shown once.
5. Paste it into **DeepSeek API key** in TubeScribe Settings.
6. If DeepSeek reports insufficient balance, add credit in your DeepSeek Platform account and try again.

See the [official DeepSeek API documentation](https://api-docs.deepseek.com/) for current account and API details.

Open **Settings** from the side panel. You can also open the TubeScribe **Options** page from its card at `chrome://extensions` or by right-clicking its toolbar icon. Paste keys only into these Settings fields. Never paste a key into an AI chat, repository file, screenshot, or public message.

The published version supports DeepSeek V4 Flash as its only AI provider:

```text
Base URL: https://api.deepseek.com
Model: deepseek-v4-flash
```

TubeScribe sends every DeepSeek request in non-thinking mode for responsive, predictable interactions. The endpoint and model are fixed in Settings, so the only AI credential you enter is your DeepSeek API key. To use another provider or model, copy the safe customization prompt in Settings and give it to a coding agent for your local copy. Never add an API key to that prompt or chat.

Keys and settings are stored in Chrome's local extension storage on your device. Release builds do not include or use `config.js`.

## Use TubeScribe

1. Open a standard YouTube watch page with captions.
2. Click the TubeScribe extension icon to open the side panel.
3. Read the timestamped transcript, or choose **Original**, **中文**, or **双语**.
4. Open **Overview** when you want AI-generated chapters and key quotes.
5. Select transcript text when you want an AI explanation.
6. Save a note from the player or a key quote, then revisit it from **Notes**.

## What works today

- Google Chrome 116 or newer, using the Side Panel API.
- Standard `youtube.com/watch` video pages.
- Native subtitle tracks returned by Supadata. TubeScribe prefers English when available, but may show another native language.
- Original, Simplified Chinese, and aligned bilingual transcript views.
- AI overviews, selected-text explanations, translation, and automatic note polishing.
- Local notes and a local cache for recent transcript and digest results.
- DeepSeek V4 Flash for all published AI features. Other providers require a local code adaptation and are not supported by this published version.

Shorts, live streams, private or access-restricted videos, and videos without an available native transcript may not work. Firefox, Safari, mobile browsers, and other Chromium browsers are not currently tested or supported.

TubeScribe forces Supadata's `mode=native`. It does not request AI-generated transcripts or perform local audio transcription when native captions are unavailable.

## Supadata free tier and request costs

Current as of August 9, 2026, the [Supadata pricing page](https://supadata.ai/pricing) lists a free tier with **100 credits per month**, no credit card required. Unused credits do not roll over. Supadata pricing can change, so check the current page before relying on these numbers.

The [Supadata transcript documentation](https://docs.supadata.ai/get-transcript) describes the transcript request modes and credit behavior:

- A native transcript request uses **1 credit**, regardless of video duration.
- A generated transcript costs **2 credits per video minute**. TubeScribe does not use this path because it forces `mode=native`.
- An unavailable native lookup returned as HTTP `206` still uses **1 credit**.

With the current native-only behavior, the free tier can cover roughly 100 transcript lookups per month when each request succeeds once. Retries and unavailable-caption lookups also consume credits, so actual successful-video coverage can be lower.

DeepSeek usage is separate from Supadata. TubeScribe does not collect payments or resell access. Set spending limits and monitor both accounts.

## DeepSeek V4 Flash pricing

As of August 27, 2026, DeepSeek lists these USD prices per 1 million tokens on its official [pricing page](https://api-docs.deepseek.com/quick_start/pricing/):

| Token type | Off-peak | Peak |
| --- | ---: | ---: |
| Cache-hit input | $0.007 | $0.014 |
| Cache-miss input | $0.22 | $0.44 |
| Output | $0.66 | $1.32 |

Peak hours are 01:00–04:00 and 06:00–10:00 UTC, Monday through Friday. All other hours use off-peak rates.

A measured 20-minute English talk used about **32,600 input tokens** and an estimated **3,500 to 4,500 output tokens** across 43 small translation batches. At current prices, translating the full video costs approximately:

- **Off-peak: $0.003 to $0.010 USD**.
- **Peak: $0.005 to $0.020 USD**.

The lower end assumes most repeated input hits DeepSeek's cache. The upper end assumes cache misses. Translation is lazy and cached, so translating only part of a video costs less. Check the official page before relying on these prices.

## Remix it with your coding agent

This is a personal remix project. Upstream issues and pull requests are not accepted. If something breaks or you want a new feature, download or fork your own copy and ask your coding agent to fix, remix, or personalize it for you.

TubeScribe uses plain HTML, CSS, and JavaScript with no build step, so it is a friendly starting point for agent-assisted projects. Ideas to try:

- Add more translation languages and let each person choose a learning language.
- Create customized summary templates for lectures, interviews, tutorials, reviews, or research talks.
- Build a vocabulary notebook that saves a word, its sentence, meaning, and video timestamp.
- Export notes and vocabulary to Markdown, CSV, Anki, or another study tool.
- Add personal topic filters that highlight the chapters most relevant to a goal.
- Add optional local-model support for a different privacy and cost tradeoff.
- Improve accessibility with keyboard navigation, font controls, and higher-contrast themes.

Ask your agent to preserve the bring-your-own-key model, keep secrets out of source files, run the checks below, and test the remix on real videos.

If you want another AI provider or model, first open the exact TubeScribe project folder that Chrome loaded through **Load unpacked** in your coding agent. Then open TubeScribe Settings and use **Copy customization prompt**. Replace the `[PROVIDER]` and `[MODEL]` placeholders before sending it. Do not include any API key in the prompt or chat. After the agent updates your local copy, enter the key yourself in the Settings field it identifies.

## Privacy and data flow

TubeScribe makes provider requests directly from the extension:

1. It sends a canonical YouTube watch URL to Supadata to request the native transcript.
2. It sends the transcript and relevant video metadata to DeepSeek when you request AI features.
3. Focused features send only the content they need, such as selected text with context or small transcript batches for translation.
4. It stores keys, settings, notes, and recent cache entries locally in Chrome.

There is no TubeScribe account system, advertising, analytics, or telemetry. Supadata and DeepSeek still receive data under their own terms and privacy policies. See [PRIVACY.md](PRIVACY.md) for details.

## Troubleshooting

### The Digest button is missing on a YouTube video

- At `chrome://extensions`, find TubeScribe and click **Reload**, then refresh the YouTube tab.
- Confirm that you are on a standard `https://www.youtube.com/watch?...` page, not a Short, embed, or live page.
- The current version automatically follows YouTube when its responsive action bar changes. Wait a moment after the page finishes loading.
- If you have an older downloaded copy, resizing the YouTube window horizontally once may reveal the button. Then download the latest version so resizing is no longer required.
- If it is still missing, ask your coding agent to inspect the content script on that exact video page.

### The side panel does not open

- Confirm that you are on a standard `https://www.youtube.com/watch?...` page.
- At `chrome://extensions`, confirm TubeScribe is enabled and click **Reload**.
- Refresh the YouTube tab after reloading the extension.
- Ask your coding agent to inspect the extension if the problem continues.

### TubeScribe asks for setup

- Open **Settings** and save both a Supadata key and a DeepSeek key.
- This published version uses the fixed DeepSeek V4 Flash endpoint and model. There are no Base URL or Model fields to configure.
- If Settings says a legacy custom provider was removed, enter a DeepSeek key. The old AI key was cleared so it could not be reused with the wrong service.

### No transcript is found

- Confirm the video is public and has native captions.
- Check your Supadata key, remaining credits, rate limit, and account status.
- Remember that unavailable native lookups and manual retries may still consume credits.

TubeScribe will not fall back to generated transcription.

### AI requests fail

- A `401` or `403` usually means the DeepSeek key or account access is invalid.
- A `429` usually means a DeepSeek rate or spending limit was reached.
- Confirm the key was created in the DeepSeek Platform account linked above and that the account has available credit.
- If you adapted a local copy for another model, use the Settings customization prompt again and ask your coding agent to inspect that local implementation.

Never share API keys, private transcripts, or personal notes in chats, screenshots, or logs.

## Checks for coding agents

Ask your coding agent to run these commands after changing the project:

```bash
npm test
npm run check
npm run package
```

The agent should also reload the unpacked extension in Chrome and test several real YouTube videos. Automated checks do not prove that live provider requests and YouTube interactions work.

## License

MIT. See [LICENSE](LICENSE).
