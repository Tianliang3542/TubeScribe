const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const LF_PROMPT = [
  "# Translation Prompts",
  "",
  "## Chinese rules",
  "",
  "```",
  "- Use modern colloquial Simplified Chinese.",
  "- Keep {langName} natural.",
  "```",
  "",
  "## Transcript batch translation",
  "",
  "```",
  "Translate into {langName}.",
  "```",
  "",
].join("\n");

function loadBackground(promptText) {
  const listeners = { addListener() {} };
  const sandbox = {
    console,
    URL,
    TextDecoder,
    TextEncoder,
    setTimeout,
    clearTimeout,
    setInterval() {},
    clearInterval() {},
    importScripts() {},
    fetch: async () => ({ ok: true, text: async () => promptText }),
    chrome: {
      storage: {
        local: {
          setAccessLevel: () => Promise.resolve(),
          get: async () => ({}),
          set: async () => {},
          remove: async () => {},
        },
      },
      action: { onClicked: listeners },
      sidePanel: {
        setPanelBehavior() {},
        close: async () => {},
        setOptions: async () => {},
      },
      runtime: {
        onInstalled: listeners,
        onMessage: listeners,
        openOptionsPage() {},
        getURL: (resourcePath) => `chrome-extension://test/${resourcePath}`,
        sendMessage: async () => ({ success: true }),
      },
      tabs: { onUpdated: listeners, onActivated: listeners },
    },
    YTD_SETTINGS: {
      STORAGE_KEY: "ytd_settings",
      normalize: (value) => value,
      chatCompletionsUrl: (baseUrl) => `${baseUrl}/chat/completions`,
      canonicalYouTubeUrl: (videoId) =>
        `https://www.youtube.com/watch?v=${videoId}`,
    },
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read("background.js"), sandbox);
  return sandbox.__YTD_TRANSLATION_TESTING__;
}

test("loadPromptSection extracts an LF prompt section and fills variables", async () => {
  const background = loadBackground(LF_PROMPT);
  const prompt = await background.loadPromptSection(
    "translation.md",
    "Chinese rules",
    { langName: "Simplified Chinese" },
  );

  assert.match(prompt, /modern colloquial Simplified Chinese/);
  assert.match(prompt, /Keep Simplified Chinese natural\./);
  assert.doesNotMatch(prompt, /\{langName\}/);
});

test("loadPromptSection survives a CRLF checkout from Windows", async () => {
  const background = loadBackground(LF_PROMPT.replace(/\n/g, "\r\n"));
  const prompt = await background.loadPromptSection(
    "translation.md",
    "Chinese rules",
  );

  assert.match(prompt, /modern colloquial Simplified Chinese/);
  assert.equal(
    prompt.includes("\r"),
    false,
    "carriage returns must be stripped before the prompt is sent to the model",
  );
});

test("a section without a fenced block reports its own error, not a missing section", async () => {
  const promptWithoutFence = LF_PROMPT.replace(
    "```\n- Use modern colloquial Simplified Chinese.\n- Keep {langName} natural.\n```",
    "No fenced block here.",
  );
  const background = loadBackground(promptWithoutFence);

  await assert.rejects(
    () => background.loadPromptSection("translation.md", "Chinese rules"),
    /has no fenced code block/,
  );
});

test("a genuinely missing section still reports a missing section", async () => {
  const background = loadBackground(LF_PROMPT);

  await assert.rejects(
    () => background.loadPromptSection("translation.md", "Japanese rules"),
    /Prompt section not found/,
  );
});

test("committed prompt files parse with the repository's real content", async () => {
  const promptFiles = fs
    .readdirSync(path.join(root, "prompts"))
    .filter((file) => file.endsWith(".md"));

  assert.ok(promptFiles.length > 0, "prompts directory must not be empty");

  for (const file of promptFiles) {
    const text = read(path.join("prompts", file));
    const headings = [...text.matchAll(/^## (.+)$/gm)];
    assert.ok(headings.length > 0, `${file} must declare at least one section`);

    const background = loadBackground(text);
    let fencedSections = 0;

    for (let index = 0; index < headings.length; index += 1) {
      const heading = headings[index][1].trim();
      const bodyStart = headings[index].index + headings[index][0].length;
      const bodyEnd =
        index + 1 < headings.length ? headings[index + 1].index : text.length;
      const body = text.slice(bodyStart, bodyEnd);

      // Documentation-only sections (for example "Variables") carry no prompt.
      if (!body.includes("```")) continue;

      const prompt = await background.loadPromptSection(file, heading);
      assert.ok(
        prompt.trim().length > 0,
        `${file}#${heading} must produce a non-empty prompt`,
      );
      fencedSections += 1;
    }

    assert.ok(
      fencedSections > 0,
      `${file} must expose at least one fenced prompt section`,
    );
  }
});
