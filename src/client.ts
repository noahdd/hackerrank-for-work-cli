export class HackerRankClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.HACKERRANK_API_KEY || "";
    this.baseUrl = baseUrl || process.env.HACKERRANK_BASE_URL || "https://www.hackerrank.com/x/api/v3";

    if (!this.apiKey) {
      console.error("Error: HACKERRANK_API_KEY environment variable is required.");
      console.error("Generate one at: https://www.hackerrank.com/work/settings/token");
      process.exit(1);
    }
  }

  async request(path: string, params?: Record<string, string>): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`API error ${response.status}: ${body}`);
    }

    return response.json();
  }

  // Tests

  async listTests(limit = "20", offset = "0") {
    return this.request("/tests", { limit, offset });
  }

  async getTest(id: string) {
    return this.request(`/tests/${id}`, {
      additional_fields: "questions,sections,candidate_details,cutoff_score,languages,tags,role_ids,experience,sections_data",
    });
  }

  async listTestInviters(testId: string) {
    return this.request(`/tests/${testId}/inviters`);
  }

  // Candidates

  async listCandidates(testId: string, limit = "20", offset = "0") {
    return this.request(`/tests/${testId}/candidates`, { limit, offset });
  }

  async getCandidate(testId: string, candidateId: string) {
    return this.request(`/tests/${testId}/candidates/${candidateId}`, {
      additional_fields: "questions,plagiarism,comments,performance_summary,integrity_status,integrity_summary,proctor_images,candidate_details,scores_tags_split,scores_skills_split,percentage_score",
    });
  }

  async searchCandidates(testId: string, search: string, limit = "20", offset = "0") {
    return this.request(`/tests/${testId}/candidates/search`, { search, limit, offset });
  }

  async getCandidatePdf(testId: string, candidateId: string) {
    return this.request(`/tests/${testId}/candidates/${candidateId}/pdf`, { format: "url" });
  }

  // Interviews

  async listInterviews(limit = "20", offset = "0") {
    return this.request("/interviews", { limit, offset });
  }

  async getInterview(interviewId: string) {
    return this.request(`/interviews/${interviewId}`);
  }

  async getInterviewTranscript(interviewId: string) {
    return this.request(`/interviews/${interviewId}/transcript`);
  }

  // Interview code recordings (uses /api/ not /x/api/v3/)
  private get recordingsBaseUrl(): string {
    // The recordings endpoint lives at /api/ regardless of the v3 base URL
    const base = this.baseUrl.replace(/\/x\/api\/v3$/, "");
    return `${base}/api`;
  }

  async getInterviewCode(interviewId: string, run?: number): Promise<unknown> {
    const url = new URL(`${this.recordingsBaseUrl}/interviews/${interviewId}/recordings/code`);
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`API error ${response.status}: ${body}`);
    }

    const raw = await response.json() as any;
    const questions = raw?.data?.questions || [];

    const result = questions.map((q: any, idx: number) => {
      const name = q.name || `Question ${idx + 1}`;
      const lang = q.language || "unknown";
      const runs = q.runs || [];
      const ops = q.ops || [];

      // Replay OT ops to get the final editor state
      let finalCode = "";
      for (const op of ops) {
        const o = op.o || [];
        let pos = 0;
        let next = "";
        for (const c of o) {
          if (typeof c === "number") {
            if (c > 0) {
              next += finalCode.slice(pos, pos + c);
              pos += c;
            } else {
              pos += Math.abs(c);
            }
          } else if (typeof c === "string") {
            next += c;
          }
        }
        if (pos < finalCode.length) next += finalCode.slice(pos);
        finalCode = next;
      }

      if (run !== undefined) {
        // Return a specific run's code
        const r = runs[run] || runs[runs.length - 1];
        return {
          question: name,
          language: lang,
          run: run < runs.length ? run : runs.length - 1,
          total_runs: runs.length,
          code: r?.code || "",
          output: r?.response?.stdout?.[0] || "",
          stderr: r?.response?.stderr?.[0] || "",
        };
      }

      // Default: return the final editor state (last frame of replay)
      return {
        question: name,
        language: lang,
        total_runs: runs.length,
        code: finalCode,
      };
    });

    return result;
  }

  // Questions

  async listQuestions(limit = "20", offset = "0") {
    return this.request("/questions", { limit, offset });
  }

  async getQuestion(questionId: string) {
    return this.request(`/questions/${questionId}`);
  }
}

// Default client for CLI usage
let defaultClient: HackerRankClient | null = null;

function getClient(): HackerRankClient {
  if (!defaultClient) {
    defaultClient = new HackerRankClient();
  }
  return defaultClient;
}

// Re-export as standalone functions for the CLI
export const listTests = (limit?: string, offset?: string) => getClient().listTests(limit, offset);
export const getTest = (id: string) => getClient().getTest(id);
export const listTestInviters = (testId: string) => getClient().listTestInviters(testId);
export const listCandidates = (testId: string, limit?: string, offset?: string) => getClient().listCandidates(testId, limit, offset);
export const getCandidate = (testId: string, candidateId: string) => getClient().getCandidate(testId, candidateId);
export const searchCandidates = (testId: string, search: string, limit?: string, offset?: string) => getClient().searchCandidates(testId, search, limit, offset);
export const getCandidatePdf = (testId: string, candidateId: string) => getClient().getCandidatePdf(testId, candidateId);
export const listInterviews = (limit?: string, offset?: string) => getClient().listInterviews(limit, offset);
export const getInterview = (interviewId: string) => getClient().getInterview(interviewId);
export const getInterviewTranscript = (interviewId: string) => getClient().getInterviewTranscript(interviewId);
export const getInterviewCode = (interviewId: string, run?: number) => getClient().getInterviewCode(interviewId, run);
export const listQuestions = (limit?: string, offset?: string) => getClient().listQuestions(limit, offset);
export const getQuestion = (questionId: string) => getClient().getQuestion(questionId);
