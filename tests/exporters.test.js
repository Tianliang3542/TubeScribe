const test = require("node:test");
const assert = require("node:assert/strict");

const YTD_EXPORTERS = require("../exporters.js");

function stubFetch(responses) {
  const calls = [];
  let index = 0;
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    const next = responses[Math.min(index, responses.length - 1)];
    index += 1;
    return {
      ok: next.status >= 200 && next.status < 300,
      status: next.status,
      text: async () => JSON.stringify(next.body ?? {}),
    };
  };
  return { calls, fetchImpl };
}

test("splitText never exceeds the provider limit and keeps words intact", () => {
  const long = "word ".repeat(600).trim();
  const parts = YTD_EXPORTERS.splitText(long, 100);

  assert.ok(parts.length > 1);
  for (const part of parts) {
    assert.ok(part.length <= 100, `chunk too long: ${part.length}`);
    assert.equal(part.startsWith(" "), false, "chunks must not start with a space");
  }
  assert.equal(parts.join(" ").replace(/\s+/g, " "), long.replace(/\s+/g, " "));
});

test("short text stays in a single chunk and blank text produces none", () => {
  assert.deepEqual(YTD_EXPORTERS.splitText("hello"), ["hello"]);
  assert.deepEqual(YTD_EXPORTERS.splitText("   "), []);
  assert.deepEqual(YTD_EXPORTERS.splitText(""), []);
});

test("buildNotionBlocks turns each non-empty line into a paragraph", () => {
  const blocks = YTD_EXPORTERS.buildNotionBlocks("# Title\n\nBody line\n\n");

  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].type, "paragraph");
  assert.equal(blocks[0].paragraph.rich_text[0].text.content, "# Title");
  assert.equal(blocks[1].paragraph.rich_text[0].text.content, "Body line");
});

test("a very long single line is split across several blocks", () => {
  const blocks = YTD_EXPORTERS.buildNotionBlocks("x".repeat(4500));

  assert.ok(blocks.length >= 3);
  for (const block of blocks) {
    assert.ok(block.paragraph.rich_text[0].text.content.length <= 1900);
  }
});

test("buildNotionPageRequest sends at most 100 blocks and keeps the rest", () => {
  const markdown = Array.from({ length: 250 }, (_, i) => `line ${i}`).join("\n");
  const request = YTD_EXPORTERS.buildNotionPageRequest({
    pageId: "11111111-2222-3333-4444-555555555555",
    title: "Video",
    markdown,
  });

  assert.equal(request.children.length, 100);
  assert.equal(request.__remainingBlocks.length, 150);
  assert.equal(request.parent.page_id, "11111111-2222-3333-4444-555555555555");
  assert.equal(
    request.properties.title.title[0].text.content,
    "Video",
  );
});

test("buildGetnoteRequest uses the documented field names", () => {
  const body = YTD_EXPORTERS.buildGetnoteRequest({
    title: "Video",
    markdown: "# Heading",
    tags: ["youtube"],
    topicId: "topic-1",
  });

  assert.equal(body.note_type, "plain_text");
  assert.equal(body.title, "Video");
  assert.equal(body.content, "# Heading");
  assert.deepEqual(body.tags, ["youtube"]);
  assert.equal(body.topic_id, "topic-1");
});

test("buildGetnoteRequest omits empty optional fields", () => {
  const body = YTD_EXPORTERS.buildGetnoteRequest({
    title: "Video",
    markdown: "x",
    tags: [],
  });

  assert.equal("tags" in body, false);
  assert.equal("topic_id" in body, false);
});

test("createNotionPage sends the integration headers and appends the tail", async () => {
  const markdown = Array.from({ length: 150 }, (_, i) => `line ${i}`).join("\n");
  const { calls, fetchImpl } = stubFetch([
    { status: 200, body: { id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" } },
    { status: 200, body: {} },
  ]);

  const result = await YTD_EXPORTERS.createNotionPage(
    {
      token: "secret_notion_token",
      pageId: "11111111-2222-3333-4444-555555555555",
      title: "Video",
      markdown,
    },
    fetchImpl,
  );

  assert.equal(result.success, true);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, "https://api.notion.com/v1/pages");
  assert.equal(
    calls[0].options.headers.Authorization,
    "Bearer secret_notion_token",
  );
  assert.equal(calls[0].options.headers["Notion-Version"], "2022-06-28");
  assert.equal(calls[1].url.includes("/blocks/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/children"), true);
  assert.equal(calls[1].options.method, "PATCH");
  assert.equal(
    JSON.parse(calls[1].options.body).children.length,
    50,
  );
});

test("createNotionPage explains an unauthorised token instead of dumping JSON", async () => {
  const { fetchImpl } = stubFetch([{ status: 401, body: { message: "unauthorized" } }]);

  const result = await YTD_EXPORTERS.createNotionPage(
    { token: "bad", pageId: "11111111-2222-3333-4444-555555555555", title: "t", markdown: "x" },
    fetchImpl,
  );

  assert.equal(result.success, false);
  assert.match(result.error, /shared with the integration/);
});

test("createGetnoteNote sends both required headers and reads the nested id", async () => {
  const { calls, fetchImpl } = stubFetch([
    { status: 200, body: { success: true, data: { note_id: "98765" } } },
  ]);

  const result = await YTD_EXPORTERS.createGetnoteNote(
    {
      apiKey: "gk_live_example",
      clientId: "cli_example",
      title: "Video",
      markdown: "# Heading",
    },
    fetchImpl,
  );

  assert.equal(result.success, true);
  assert.equal(result.noteId, "98765");
  assert.equal(calls[0].url, "https://openapi.biji.com/open/api/v1/resource/note/save");
  assert.equal(calls[0].options.headers.Authorization, "gk_live_example");
  assert.equal(calls[0].options.headers["X-Client-ID"], "cli_example");
});

test("createGetnoteNote refuses to call the API without a client id", async () => {
  const { calls, fetchImpl } = stubFetch([{ status: 200, body: {} }]);

  const result = await YTD_EXPORTERS.createGetnoteNote(
    { apiKey: "gk_live_example", clientId: "", title: "t", markdown: "x" },
    fetchImpl,
  );

  assert.equal(result.success, false);
  assert.match(result.error, /client ID/);
  assert.equal(calls.length, 0, "no request may be made without credentials");
});

test("rate limiting is reported in words, not as a bare status code", async () => {
  const { fetchImpl } = stubFetch([{ status: 429, body: { reason: "not_member" } }]);

  const result = await YTD_EXPORTERS.createGetnoteNote(
    { apiKey: "k", clientId: "c", title: "t", markdown: "x" },
    fetchImpl,
  );

  assert.equal(result.success, false);
  assert.match(result.error, /paid member/);
});

test("a network failure becomes a readable message", async () => {
  const fetchImpl = async () => {
    throw new Error("getaddrinfo ENOTFOUND");
  };

  const result = await YTD_EXPORTERS.createNotionPage(
    { token: "t", pageId: "11111111-2222-3333-4444-555555555555", title: "t", markdown: "x" },
    fetchImpl,
  );

  assert.equal(result.success, false);
  assert.match(result.error, /ENOTFOUND/);
});
