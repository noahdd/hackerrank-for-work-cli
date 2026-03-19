import { describe, it, expect, beforeAll } from "vitest";
import { HackerRankClient } from "../../src/client.js";

/**
 * Integration tests — hit the real HackerRank API.
 * Requires HACKERRANK_API_KEY env var.
 *
 * Run: HACKERRANK_API_KEY=your-key npm run test:integration
 */

const API_KEY = process.env.HACKERRANK_API_KEY;

describe.skipIf(!API_KEY)("HackerRank API integration", () => {
  let client: HackerRankClient;

  beforeAll(() => {
    client = new HackerRankClient(API_KEY);
  });

  describe("tests", () => {
    it("lists tests", async () => {
      const result = await client.listTests("5", "0") as any;
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
      expect(result).toHaveProperty("total");
    });

    it("gets a specific test when tests exist", async () => {
      const list = await client.listTests("1", "0") as any;
      if (list.data.length === 0) return; // skip if no tests

      const testId = list.data[0].id;
      const result = await client.getTest(testId) as any;
      expect(result).toHaveProperty("id", testId);
      expect(result).toHaveProperty("name");
    });
  });

  describe("candidates", () => {
    it("lists candidates for a test", async () => {
      const tests = await client.listTests("1", "0") as any;
      if (tests.data.length === 0) return;

      const testId = tests.data[0].id;
      const result = await client.listCandidates(testId, "5", "0") as any;
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("gets a specific candidate when candidates exist", async () => {
      const tests = await client.listTests("1", "0") as any;
      if (tests.data.length === 0) return;

      const testId = tests.data[0].id;
      const candidates = await client.listCandidates(testId, "1", "0") as any;
      if (candidates.data.length === 0) return;

      const candidateId = candidates.data[0].id;
      const result = await client.getCandidate(testId, candidateId) as any;
      expect(result).toHaveProperty("id", candidateId);
      expect(result).toHaveProperty("email");
    });
  });

  describe("interviews", () => {
    it("lists interviews", async () => {
      const result = await client.listInterviews("5", "0") as any;
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("gets a specific interview when interviews exist", async () => {
      const list = await client.listInterviews("1", "0") as any;
      if (list.data.length === 0) return;

      const interviewId = list.data[0].id;
      const result = await client.getInterview(interviewId) as any;
      expect(result).toHaveProperty("id", interviewId);
    });
  });

  describe("questions", () => {
    it("lists questions", async () => {
      const result = await client.listQuestions("5", "0") as any;
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("error handling", () => {
    it("throws on invalid test ID", async () => {
      await expect(client.getTest("nonexistent-id-xyz")).rejects.toThrow();
    });
  });
});
