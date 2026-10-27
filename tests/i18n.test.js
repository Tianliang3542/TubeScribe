const test = require("node:test");
const assert = require("node:assert/strict");

const YTD_I18N = require("../i18n.js");

test("every language exposes exactly the same message keys", () => {
  const keys = Object.keys(YTD_I18N.MESSAGES["zh-CN"]).sort();
  for (const language of YTD_I18N.LANGUAGES) {
    assert.deepEqual(
      Object.keys(YTD_I18N.MESSAGES[language]).sort(),
      keys,
      `${language} must define the same keys as zh-CN`,
    );
  }
});

test("no message is empty or untranslated placeholder text", () => {
  for (const language of YTD_I18N.LANGUAGES) {
    for (const [key, value] of Object.entries(YTD_I18N.MESSAGES[language])) {
      assert.equal(typeof value, "string", `${language}.${key} must be a string`);
      assert.ok(value.trim().length > 0, `${language}.${key} must not be empty`);
      assert.equal(
        value.includes("{"),
        false,
        `${language}.${key} must not leave an unfilled placeholder`,
      );
    }
  }
});

test("every DOM binding points at a key both languages define", () => {
  for (const [selector, key, attribute] of YTD_I18N.TEXT_BINDINGS) {
    assert.ok(selector.length > 0, "binding selector must not be empty");
    if (attribute !== undefined) {
      assert.ok(
        ["title", "placeholder", "aria-label"].includes(attribute),
        `unexpected attribute binding: ${attribute}`,
      );
    }
    for (const language of YTD_I18N.LANGUAGES) {
      assert.equal(
        typeof YTD_I18N.MESSAGES[language][key],
        "string",
        `${language} is missing ${key}`,
      );
    }
  }
});

test("an unknown language falls back to the default instead of crashing", () => {
  assert.equal(YTD_I18N.normalizeLanguage("fr"), YTD_I18N.DEFAULT_LANGUAGE);
  assert.equal(YTD_I18N.normalizeLanguage(undefined), "zh-CN");
  assert.equal(
    YTD_I18N.t("settings", "fr"),
    YTD_I18N.MESSAGES["zh-CN"].settings,
  );
});

test("the switch button toggles between exactly two languages", () => {
  assert.equal(YTD_I18N.nextLanguage("zh-CN"), "en");
  assert.equal(YTD_I18N.nextLanguage("en"), "zh-CN");
  assert.equal(YTD_I18N.nextLanguage("fr"), "en");
});

test("the Chinese and English labels actually differ for chrome copy", () => {
  assert.notEqual(
    YTD_I18N.t("tabTranscript", "zh-CN"),
    YTD_I18N.t("tabTranscript", "en"),
  );
  assert.equal(YTD_I18N.t("tabTranscript", "zh-CN"), "逐字稿");
  assert.equal(YTD_I18N.t("tabTranscript", "en"), "Transcript");
});

test("applying a language without a DOM is a no-op rather than a crash", () => {
  const result = YTD_I18N.applyInterfaceLanguage("en", null);
  assert.equal(result.language, "en");
  assert.equal(result.applied, 0);
});
