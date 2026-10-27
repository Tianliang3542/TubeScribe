const test = require("node:test");
const assert = require("node:assert/strict");

const YTD_SETTINGS = require("../settings.js");
const YTD_OPTIONS = require("../options.js");

function createChromeStorage(initial = {}) {
  const values = { ...initial };
  const chromeApi = {
    storage: {
      local: {
        async get(key) {
          if (key === null) return { ...values };
          if (Array.isArray(key)) {
            return Object.fromEntries(key.map((item) => [item, values[item]]));
          }
          return Object.hasOwn(values, key) ? { [key]: values[key] } : {};
        },
        async set(items) {
          Object.assign(values, items);
        },
        async remove(keys) {
          for (const key of Array.isArray(keys) ? keys : [keys]) delete values[key];
        },
        async clear() {
          for (const key of Object.keys(values)) delete values[key];
        },
      },
    },
  };
  return { values, storage: YTD_OPTIONS.createStorageAdapter(chromeApi) };
}

test("normalize keeps every knowledge-base field instead of dropping it", () => {
  const settings = YTD_SETTINGS.normalize({
    supadataApiKey: "  sd_key  ",
    aiApiKey: "  ai_key  ",
    notionToken: "  secret_token  ",
    notionPageId: "https://www.notion.so/workspace/1111111122223333444455555555ffff?pvs=4",
    getnoteApiKey: "  gk_live_key  ",
    getnoteClientId: "  cli_id  ",
    getnoteTopicId: "  topic-9  ",
    keepTechnicalTerms: true,
    followPlayback: false,
    uiLanguage: "en",
  });

  assert.equal(settings.supadataApiKey, "sd_key");
  assert.equal(settings.aiApiKey, "ai_key");
  assert.equal(settings.notionToken, "secret_token");
  assert.equal(settings.notionPageId, "11111111-2222-3333-4444-55555555ffff");
  assert.equal(settings.getnoteApiKey, "gk_live_key");
  assert.equal(settings.getnoteClientId, "cli_id");
  assert.equal(settings.getnoteTopicId, "topic-9");
  assert.equal(settings.keepTechnicalTerms, true);
  assert.equal(settings.followPlayback, false);
  assert.equal(settings.uiLanguage, "en");
});

test("normalize defaults are the safe ones for a new install", () => {
  const settings = YTD_SETTINGS.normalize({});

  assert.equal(settings.uiLanguage, "zh-CN");
  assert.equal(settings.keepTechnicalTerms, false, "translation is complete by default");
  assert.equal(settings.followPlayback, true, "playback following is on by default");
  assert.equal(settings.notionToken, "");
  assert.equal(settings.getnoteClientId, "");
});

test("an unusable Notion page id becomes empty rather than invalid", () => {
  assert.equal(YTD_SETTINGS.normalizeNotionPageId(""), "");
  assert.equal(YTD_SETTINGS.normalizeNotionPageId("not a notion id"), "");
  assert.equal(
    YTD_SETTINGS.normalizeNotionPageId("AAAAAAAABBBBCCCCDDDDEEEEFFFF0000"),
    "aaaaaaaa-bbbb-cccc-dddd-eeeeffff0000",
  );
});

test("changing the interface language never wipes stored API keys", async () => {
  const { values, storage } = createChromeStorage({
    [YTD_SETTINGS.STORAGE_KEY]: YTD_SETTINGS.normalize({
      aiApiKey: "deepseek-key",
      supadataApiKey: "supadata-key",
      notionToken: "notion-secret",
      notionPageId: "1111111122223333444455555555ffff",
      getnoteApiKey: "gk_live_x",
      getnoteClientId: "cli_x",
    }),
  });

  await YTD_OPTIONS.persistPreferredLanguage(storage, "en");

  const saved = values[YTD_SETTINGS.STORAGE_KEY];
  assert.equal(saved.uiLanguage, "en");
  assert.equal(saved.aiApiKey, "deepseek-key");
  assert.equal(saved.supadataApiKey, "supadata-key");
  assert.equal(saved.notionToken, "notion-secret");
  assert.equal(saved.notionPageId, "11111111-2222-3333-4444-55555555ffff");
  assert.equal(saved.getnoteApiKey, "gk_live_x");
  assert.equal(saved.getnoteClientId, "cli_x");
});

test("the panel and the settings page read the same language choice", async () => {
  const { values, storage } = createChromeStorage({
    [YTD_SETTINGS.STORAGE_KEY]: YTD_SETTINGS.normalize({ uiLanguage: "en" }),
  });

  assert.equal(await YTD_OPTIONS.readPreferredLanguage(storage), "en");

  // Simulate the old standalone key still sitting in storage from a previous
  // version: the shared settings value must win.
  values[YTD_OPTIONS.LANGUAGE_STORAGE_KEY] = "zh-CN";
  assert.equal(await YTD_OPTIONS.readPreferredLanguage(storage), "en");
});

test("the legacy language key is still honoured when settings has no choice", async () => {
  const { values, storage } = createChromeStorage({
    [YTD_OPTIONS.LANGUAGE_STORAGE_KEY]: "zh-CN",
  });
  delete values[YTD_SETTINGS.STORAGE_KEY];

  assert.equal(await YTD_OPTIONS.readPreferredLanguage(storage), "zh-CN");
});

test("a followPlayback preference of false survives a normalize round trip", () => {
  const once = YTD_SETTINGS.normalize({ followPlayback: false });
  const twice = YTD_SETTINGS.normalize(once);

  assert.equal(twice.followPlayback, false);
  assert.equal(YTD_SETTINGS.normalize({ followPlayback: true }).followPlayback, true);
  assert.equal(YTD_SETTINGS.normalize({ followPlayback: "false" }).followPlayback, true);
});

test("normalizing a Notion page id twice changes nothing", () => {
  const once = YTD_SETTINGS.normalizeNotionPageId(
    "1111111122223333444455555555ffff",
  );
  const twice = YTD_SETTINGS.normalizeNotionPageId(once);

  assert.equal(once, "11111111-2222-3333-4444-55555555ffff");
  assert.equal(twice, once);
});