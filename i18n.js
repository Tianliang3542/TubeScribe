/**
 * Interface language pack for the side panel.
 *
 * Only chrome copy lives here. Transcripts, translations and AI output are
 * content, not interface, and are never touched by this file.
 *
 * Binding is selector-based so the shipped HTML keeps working unchanged: the
 * extension adds the language button and calls applyInterfaceLanguage().
 */
var YTD_I18N = (() => {
  const DEFAULT_LANGUAGE = "zh-CN";
  const LANGUAGES = Object.freeze(["zh-CN", "en"]);

  const MESSAGES = Object.freeze({
    "zh-CN": Object.freeze({
      settings: "设置",
      languageButton: "界面语言",
      languageButtonShort: "EN",
      tabTranscript: "逐字稿",
      tabOverview: "概览",
      tabNotes: "笔记",
      modeOriginal: "原文",
      modeChinese: "中文",
      modeBilingual: "双语",
      fullTranscript: "完整逐字稿",
      copy: "复制",
      exportTranscript: "导出",
      searchPlaceholder: "搜索单词或短语",
      searchLabel: "搜索逐字稿",
      clearSearch: "清空搜索",
      previousMatch: "上一处匹配",
      nextMatch: "下一处匹配",
      chapters: "章节",
      keyQuotes: "关键引用",
      savedNotes: "已保存笔记",
      filterThisVideo: "本视频",
      filterAllNotes: "全部笔记",
      notesIntro:
        "把鼠标移到视频上并点击“笔记”保存带时间戳的笔记，或在视频聚焦时按 n 键。",
      followPlayback: "跟随播放",
      welcomeTitle: "准备就绪",
      welcomeDesc: "打开一个 YouTube 视频，然后点击扩展图标，生成 AI 摘要。",
      tryAgain: "重试",
      exporting: "正在导出…",
      exportDone: "已导出",
      exportFailed: "导出失败",
    }),
    en: Object.freeze({
      settings: "Settings",
      languageButton: "Interface language",
      languageButtonShort: "中",
      tabTranscript: "Transcript",
      tabOverview: "Overview",
      tabNotes: "Notes",
      modeOriginal: "Original",
      modeChinese: "中文",
      modeBilingual: "双语",
      fullTranscript: "Full Transcript",
      copy: "Copy",
      exportTranscript: "Export",
      searchPlaceholder: "Search words or phrases",
      searchLabel: "Search transcript",
      clearSearch: "Clear search",
      previousMatch: "Previous match",
      nextMatch: "Next match",
      chapters: "Chapters",
      keyQuotes: "Key Quotes",
      savedNotes: "Saved Notes",
      filterThisVideo: "This Video",
      filterAllNotes: "All Notes",
      notesIntro:
        'Move your mouse over the video and click Note to save a timestamped note, or press the "n" key while the video is focused.',
      followPlayback: "Follow playback",
      welcomeTitle: "Ready to Digest",
      welcomeDesc:
        "Navigate to a YouTube video and click the extension icon to get an AI-powered digest.",
      tryAgain: "Try Again",
      exporting: "Exporting…",
      exportDone: "Exported",
      exportFailed: "Export failed",
    }),
  });

  // Selector, message key, and optionally the attribute to write.
  const TEXT_BINDINGS = Object.freeze([
    ["#settingsBtn", "settings"],
    ["#uiLanguageBtn", "languageButton", "title"],
    ['.tab[data-tab="transcript"]', "tabTranscript"],
    ['.tab[data-tab="overview"]', "tabOverview"],
    ['.tab[data-tab="notes"]', "tabNotes"],
    ['.transcript-mode-btn[data-transcript-mode="original"]', "modeOriginal"],
    ['.transcript-mode-btn[data-transcript-mode="zh"]', "modeChinese"],
    ['.transcript-mode-btn[data-transcript-mode="bilingual"]', "modeBilingual"],
    ["#copyTranscriptBtn", "copy"],
    ["#exportTranscriptBtn", "exportTranscript"],
    ["#transcriptSearchInput", "searchPlaceholder", "placeholder"],
    ["#transcriptSearchInput", "searchLabel", "aria-label"],
    ["#transcriptSearchClearBtn", "clearSearch", "title"],
    ["#transcriptSearchPrevBtn", "previousMatch", "title"],
    ["#transcriptSearchNextBtn", "nextMatch", "title"],
    ["#followPlaybackBtn", "followPlayback"],
    ["#notesFilterThis", "filterThisVideo"],
    ["#notesFilterAll", "filterAllNotes"],
    ["#notesIntro", "notesIntro"],
    ["#errorBtn", "tryAgain"],
    ['[data-panel="transcript"] .section-title', "fullTranscript"],
    ['[data-panel="notes"] .section-title', "savedNotes"],
    [".welcome-title", "welcomeTitle"],
    [".welcome-desc", "welcomeDesc"],
  ]);

  function normalizeLanguage(value) {
    return LANGUAGES.includes(value) ? value : DEFAULT_LANGUAGE;
  }

  function t(key, language, variables) {
    const lang = normalizeLanguage(language);
    const table = MESSAGES[lang];
    let text = table[key];
    if (typeof text !== "string") text = MESSAGES[DEFAULT_LANGUAGE][key];
    if (typeof text !== "string") return String(key);
    if (variables) {
      for (const [name, value] of Object.entries(variables)) {
        text = text.split(`{${name}}`).join(String(value ?? ""));
      }
    }
    return text;
  }

  /**
   * Rewrites every bound element. The Overview tab has two section titles in
   * the same panel, so they are positional rather than selector-bound.
   */
  function applyInterfaceLanguage(language, root) {
    const doc = root || (typeof document !== "undefined" ? document : null);
    const lang = normalizeLanguage(language);
    if (!doc) return { language: lang, applied: 0 };

    let applied = 0;
    for (const [selector, key, attribute] of TEXT_BINDINGS) {
      doc.querySelectorAll(selector).forEach((element) => {
        const text = t(key, lang);
        if (attribute) element.setAttribute(attribute, text);
        else element.textContent = text;
        applied += 1;
      });
    }

    const overviewTitles = doc.querySelectorAll(
      '[data-panel="overview"] .section-title',
    );
    if (overviewTitles[0]) {
      overviewTitles[0].textContent = t("chapters", lang);
      applied += 1;
    }
    if (overviewTitles[1]) {
      overviewTitles[1].textContent = t("keyQuotes", lang);
      applied += 1;
    }

    if (doc.documentElement) doc.documentElement.lang = lang;
    return { language: lang, applied };
  }

  function nextLanguage(language) {
    return normalizeLanguage(language) === "zh-CN" ? "en" : "zh-CN";
  }

  return {
    DEFAULT_LANGUAGE,
    LANGUAGES,
    MESSAGES,
    TEXT_BINDINGS,
    normalizeLanguage,
    nextLanguage,
    t,
    applyInterfaceLanguage,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = YTD_I18N;
}
