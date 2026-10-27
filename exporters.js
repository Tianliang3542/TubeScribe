/**
 * Knowledge-base exporters.
 *
 * Both services are called directly from the extension's service worker. The
 * extension holds host permissions for each API, so these requests are not
 * subject to browser CORS rules and no proxy server is involved.
 *
 * Nothing here stores or logs a credential; keys arrive from
 * chrome.storage.local through the caller.
 */
var YTD_EXPORTERS = (() => {
  const NOTION_API = "https://api.notion.com/v1";
  const NOTION_VERSION = "2022-06-28";
  const GETNOTE_API = "https://openapi.biji.com/open/api/v1";
  const NOTION_TEXT_LIMIT = 1900; // Notion rejects rich_text over 2000 chars
  const NOTION_BLOCKS_PER_REQUEST = 100;
  const REQUEST_TIMEOUT_MS = 30_000;

  /**
   * Splits long text on a paragraph or word boundary so no single rich_text
   * object exceeds the provider limit.
   */
  function splitText(text, limit = NOTION_TEXT_LIMIT) {
    const out = [];
    let rest = String(text ?? "");
    while (rest.length > limit) {
      let cut = rest.lastIndexOf("\n", limit);
      if (cut < limit / 2) cut = rest.lastIndexOf(" ", limit);
      if (cut <= 0) cut = limit;
      out.push(rest.slice(0, cut));
      // The cut lands on a boundary character, so drop the separator too.
      rest = rest.slice(cut).replace(/^\s+/, "");
    }
    if (rest.trim()) out.push(rest);
    return out;
  }

  /**
   * One Notion paragraph block per non-empty markdown line. Deliberately
   * simple: headings and lists stay as text so nothing is silently rewritten.
   */
  function buildNotionBlocks(markdown) {
    const blocks = [];
    for (const rawLine of String(markdown ?? "").split("\n")) {
      const line = rawLine.trimEnd();
      if (!line.trim()) continue;
      for (const chunk of splitText(line)) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: chunk } }],
          },
        });
      }
    }
    return blocks;
  }

  function buildNotionPageRequest({ pageId, title, markdown }) {
    const blocks = buildNotionBlocks(markdown);
    return {
      parent: { page_id: pageId },
      properties: {
        title: {
          title: [{ type: "text", text: { content: String(title ?? "") } }],
        },
      },
      children: blocks.slice(0, NOTION_BLOCKS_PER_REQUEST),
      __remainingBlocks: blocks.slice(NOTION_BLOCKS_PER_REQUEST),
    };
  }

  function buildGetnoteRequest({ title, markdown, tags, topicId }) {
    const body = {
      note_type: "plain_text",
      title: String(title ?? ""),
      content: String(markdown ?? ""),
    };
    if (Array.isArray(tags) && tags.length > 0) body.tags = tags;
    if (topicId) body.topic_id = topicId;
    return body;
  }

  /**
   * Maps a provider response to a message a human can act on. Both services
   * use different shapes, so the caller passes the parsed body.
   */
  function describeFailure(status, body, service) {
    const code = body?.code ?? body?.error_code;
    const providerMessage =
      body?.message || body?.error_description || body?.error || "";

    if (status === 401 || status === 403) {
      return service === "notion"
        ? "Notion rejected the token. Check the integration token and that the target page is shared with the integration."
        : "GetNote rejected the credentials. Check the API key and the client ID, and make sure both belong to the same app.";
    }
    if (status === 429) {
      return service === "notion"
        ? "Notion rate limit reached. Try again in a minute."
        : "GetNote rate limit reached, or the account is not a paid member. Note creation also has a daily cap.";
    }
    if (status === 404) {
      return service === "notion"
        ? "Notion page not found. Confirm the page id and that it is shared with the integration."
        : "GetNote endpoint not found. Check the API base URL.";
    }
    if (status >= 500) {
      return `${service} is having trouble (HTTP ${status}). Try again later.`;
    }
    return `${service} returned HTTP ${status}${providerMessage ? `: ${providerMessage}` : ""}${code ? ` (code ${code})` : ""}`;
  }

  async function requestJson(url, { method = "POST", headers, body }, fetchImpl) {
    const doFetch = fetchImpl || (typeof fetch === "function" ? fetch : null);
    if (!doFetch) return { ok: false, error: "No fetch implementation available" };

    const controller =
      typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller
      ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      : null;

    try {
      const response = await doFetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
        signal: controller?.signal,
      });
      const text = await response.text();
      let parsed = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = null;
      }
      return { ok: response.ok, status: response.status, data: parsed, raw: text };
    } catch (error) {
      const aborted = error?.name === "AbortError";
      return {
        ok: false,
        error: aborted ? "Request timed out" : error?.message || "Network error",
      };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function createNotionPage(
    { token, pageId, title, markdown },
    fetchImpl,
  ) {
    if (!token) return { success: false, error: "Notion integration token is not configured" };
    if (!pageId) return { success: false, error: "Notion target page is not configured" };

    const request = buildNotionPageRequest({ pageId, title, markdown });
    const remaining = request.__remainingBlocks;
    delete request.__remainingBlocks;

    const created = await requestJson(
      `${NOTION_API}/pages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: request,
      },
      fetchImpl,
    );

    if (!created.ok) {
      return {
        success: false,
        error: created.error || describeFailure(created.status, created.data, "notion"),
      };
    }

    const newPageId = created.data?.id;
    let appendError = "";

    // A single requests carries at most 100 blocks; append the rest in order.
    for (let index = 0; index < remaining.length; index += NOTION_BLOCKS_PER_REQUEST) {
      const chunk = remaining.slice(index, index + NOTION_BLOCKS_PER_REQUEST);
      const appended = await requestJson(
        `${NOTION_API}/blocks/${newPageId}/children`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
          },
          body: { children: chunk },
        },
        fetchImpl,
      );
      if (!appended.ok) {
        appendError =
          appended.error || describeFailure(appended.status, appended.data, "notion");
        break;
      }
    }

    return {
      success: true,
      pageId: newPageId,
      url: newPageId
        ? `https://www.notion.so/${String(newPageId).replace(/-/g, "")}`
        : "",
      warning: appendError
        ? `Page created, but the tail of the transcript was not appended: ${appendError}`
        : "",
    };
  }

  async function createGetnoteNote(
    { apiKey, clientId, title, markdown, tags, topicId },
    fetchImpl,
  ) {
    if (!apiKey) return { success: false, error: "GetNote API key is not configured" };
    if (!clientId) {
      return {
        success: false,
        error: "GetNote client ID is not configured. Both headers are required.",
      };
    }

    const result = await requestJson(
      `${GETNOTE_API}/resource/note/save`,
      {
        headers: {
          Authorization: apiKey,
          "X-Client-ID": clientId,
          "Content-Type": "application/json",
        },
        body: buildGetnoteRequest({ title, markdown, tags, topicId }),
      },
      fetchImpl,
    );

    if (!result.ok) {
      return {
        success: false,
        error: result.error || describeFailure(result.status, result.data, "getnote"),
      };
    }

    const data = result.data?.data || result.data || {};
    const noteId = data.note_id || data.id || "";
    return {
      success: true,
      noteId: String(noteId || ""),
      url: noteId ? `https://www.biji.com/note/${noteId}` : "",
    };
  }

  return {
    NOTION_TEXT_LIMIT,
    NOTION_BLOCKS_PER_REQUEST,
    splitText,
    buildNotionBlocks,
    buildNotionPageRequest,
    buildGetnoteRequest,
    describeFailure,
    createNotionPage,
    createGetnoteNote,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = YTD_EXPORTERS;
}
