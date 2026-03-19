import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HackerRankClient } from "../../src/client.js";

const MOCK_KEY = "test-api-key-123";

function mockFetch(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  });
}

describe("HackerRankClient", () => {
  let client: HackerRankClient;

  beforeEach(() => {
    client = new HackerRankClient(MOCK_KEY, "https://api.test.com/x/api/v3");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("authentication", () => {
    it("sends Basic Auth header with API key", async () => {
      const fetchSpy = mockFetch({ data: [] });
      vi.stubGlobal("fetch", fetchSpy);

      await client.listTests();

      const [, options] = fetchSpy.mock.calls[0];
      const expectedAuth = `Basic ${Buffer.from(MOCK_KEY + ":").toString("base64")}`;
      expect(options.headers.Authorization).toBe(expectedAuth);
    });

    it("sends Accept: application/json header", async () => {
      const fetchSpy = mockFetch({ data: [] });
      vi.stubGlobal("fetch", fetchSpy);

      await client.listTests();

      const [, options] = fetchSpy.mock.calls[0];
      expect(options.headers.Accept).toBe("application/json");
    });
  });

  describe("request URL construction", () => {
    it("builds correct URL for listTests", async () => {
      const fetchSpy = mockFetch({ data: [] });
      vi.stubGlobal("fetch", fetchSpy);

      await client.listTests("10", "5");

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toBe("https://api.test.com/x/api/v3/tests?limit=10&offset=5");
    });

    it("builds correct URL for getTest", async () => {
      const fetchSpy = mockFetch({ id: "abc123" });
      vi.stubGlobal("fetch", fetchSpy);

      await client.getTest("abc123");

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain("/tests/abc123");
      expect(url).toContain("additional_fields=");
    });

    it("builds correct URL for listCandidates", async () => {
      const fetchSpy = mockFetch({ data: [] });
      vi.stubGlobal("fetch", fetchSpy);

      await client.listCandidates("test1", "20", "0");

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toBe("https://api.test.com/x/api/v3/tests/test1/candidates?limit=20&offset=0");
    });

    it("builds correct URL for getCandidate", async () => {
      const fetchSpy = mockFetch({ id: "cand1" });
      vi.stubGlobal("fetch", fetchSpy);

      await client.getCandidate("test1", "cand1");

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain("/tests/test1/candidates/cand1");
      expect(url).toContain("additional_fields=");
    });

    it("builds correct URL for searchCandidates", async () => {
      const fetchSpy = mockFetch({ data: [] });
      vi.stubGlobal("fetch", fetchSpy);

      await client.searchCandidates("test1", "alice@example.com");

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain("/tests/test1/candidates/search");
      expect(url).toContain("search=alice");
    });

    it("builds correct URL for getCandidatePdf", async () => {
      const fetchSpy = mockFetch({ url: "https://pdf.example.com" });
      vi.stubGlobal("fetch", fetchSpy);

      await client.getCandidatePdf("test1", "cand1");

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain("/tests/test1/candidates/cand1/pdf");
      expect(url).toContain("format=url");
    });

    it("builds correct URL for listInterviews", async () => {
      const fetchSpy = mockFetch({ data: [] });
      vi.stubGlobal("fetch", fetchSpy);

      await client.listInterviews();

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain("/interviews?");
    });

    it("builds correct URL for getInterview", async () => {
      const fetchSpy = mockFetch({ id: "int1" });
      vi.stubGlobal("fetch", fetchSpy);

      await client.getInterview("int1");

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toBe("https://api.test.com/x/api/v3/interviews/int1");
    });

    it("builds correct URL for getInterviewTranscript", async () => {
      const fetchSpy = mockFetch({ transcript: [] });
      vi.stubGlobal("fetch", fetchSpy);

      await client.getInterviewTranscript("int1");

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toBe("https://api.test.com/x/api/v3/interviews/int1/transcript");
    });

    it("builds correct URL for listQuestions", async () => {
      const fetchSpy = mockFetch({ data: [] });
      vi.stubGlobal("fetch", fetchSpy);

      await client.listQuestions();

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain("/questions?");
    });

    it("builds correct URL for getQuestion", async () => {
      const fetchSpy = mockFetch({ id: "q1" });
      vi.stubGlobal("fetch", fetchSpy);

      await client.getQuestion("q1");

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toBe("https://api.test.com/x/api/v3/questions/q1");
    });
  });

  describe("error handling", () => {
    it("throws on non-ok response", async () => {
      const fetchSpy = mockFetch({ message: "Unauthorized" }, 401);
      vi.stubGlobal("fetch", fetchSpy);

      await expect(client.listTests()).rejects.toThrow("API error 401");
    });

    it("throws on 404", async () => {
      const fetchSpy = mockFetch({ message: "Not found" }, 404);
      vi.stubGlobal("fetch", fetchSpy);

      await expect(client.getTest("nonexistent")).rejects.toThrow("API error 404");
    });

    it("throws on 429 rate limit", async () => {
      const fetchSpy = mockFetch({ message: "Rate limited" }, 429);
      vi.stubGlobal("fetch", fetchSpy);

      await expect(client.listTests()).rejects.toThrow("API error 429");
    });
  });

  describe("default parameters", () => {
    it("uses default limit=20 and offset=0 for listTests", async () => {
      const fetchSpy = mockFetch({ data: [] });
      vi.stubGlobal("fetch", fetchSpy);

      await client.listTests();

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain("limit=20");
      expect(url).toContain("offset=0");
    });

    it("uses default limit=20 and offset=0 for listCandidates", async () => {
      const fetchSpy = mockFetch({ data: [] });
      vi.stubGlobal("fetch", fetchSpy);

      await client.listCandidates("test1");

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain("limit=20");
      expect(url).toContain("offset=0");
    });
  });
});
