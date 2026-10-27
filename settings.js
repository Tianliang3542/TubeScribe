/**
 * Shared, non-secret configuration helpers.
 *
 * API keys are stored in chrome.storage.local by options.js. This file contains
 * defaults and validation only, so it is safe to publish.
 */
var YTD_SETTINGS = (() => {
  const STORAGE_KEY = "ytd_settings";

  const UI_LANGUAGES = Object.freeze(["zh-CN", "en"]);

  const DEFAULTS = Object.freeze({
    provider: "deepseek",
    aiApiKey: "",
    aiBaseUrl: "https://api.deepseek.com",
    aiModel: "deepseek-v4-flash",
    supadataApiKey: "",
    // Interface language for the side panel and the options page.
    uiLanguage: "zh-CN",
    // false = translate every word except names and brands (the default);
    // true = keep common technical terms such as AI, API and skill in English.
    keepTechnicalTerms: false,
    // true = the transcript follows video playback without being asked to.
    followPlayback: true,
    notionToken: "",
    notionPageId: "",
    getnoteApiKey: "",
    getnoteClientId: "",
    getnoteTopicId: "",
  });

  const trimmed = (value) => (typeof value === "string" ? value.trim() : "");

  function isLegacyCustom(input) {
    return !!input && input.provider === "custom";
  }

  /**
   * Accepts a bare Notion page id, a dashed UUID, or a full Notion URL and
   * returns the canonical dashed UUID. Anything unrecognisable becomes "" so
   * the UI can ask again instead of sending a malformed id to the API.
   */
  function normalizeNotionPageId(value) {
    const raw = trimmed(value);
    if (!raw) return "";
    // Strip separators first so a value that is already dashed stays valid.
    // Without this, normalize() destroyed a stored page id on the next save,
    // because the 32-character run no longer exists once hyphens are present.
    const compact = raw.replace(/-/g, "");
    const match = compact.match(/([0-9a-fA-F]{32})/);
    if (!match) return "";
    const hex = match[1].toLowerCase();
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join("-");
  }

  function normalize(input = {}) {
    const source = input || {};
    return {
      provider: DEFAULTS.provider,
      aiApiKey: isLegacyCustom(source)
        ? ""
        : trimmed(source.aiApiKey),
      aiBaseUrl: DEFAULTS.aiBaseUrl,
      aiModel: DEFAULTS.aiModel,
      supadataApiKey: trimmed(source.supadataApiKey),
      uiLanguage: UI_LANGUAGES.includes(source.uiLanguage)
        ? source.uiLanguage
        : DEFAULTS.uiLanguage,
      keepTechnicalTerms: source.keepTechnicalTerms === true,
      followPlayback: source.followPlayback !== false,
      notionToken: trimmed(source.notionToken),
      notionPageId: normalizeNotionPageId(source.notionPageId),
      getnoteApiKey: trimmed(source.getnoteApiKey),
      getnoteClientId: trimmed(source.getnoteClientId),
      getnoteTopicId: trimmed(source.getnoteTopicId),
    };
  }

  function migrateLegacyCustom(input = {}) {
    return {
      settings: normalize(input),
      migrated: isLegacyCustom(input),
    };
  }

  function chatCompletionsUrl() {
    return `${DEFAULTS.aiBaseUrl}/chat/completions`;
  }

  function canonicalYouTubeUrl(videoId) {
    const normalized = String(videoId || "").trim();
    if (!/^[A-Za-z0-9_-]{6,20}$/.test(normalized)) {
      throw new Error("Invalid YouTube video ID.");
    }
    return `https://www.youtube.com/watch?v=${normalized}`;
  }

  return {
    STORAGE_KEY,
    DEFAULTS,
    UI_LANGUAGES,
    isLegacyCustom,
    normalize,
    normalizeNotionPageId,
    migrateLegacyCustom,
    chatCompletionsUrl,
    canonicalYouTubeUrl,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = YTD_SETTINGS;
}
