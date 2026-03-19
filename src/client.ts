const BASE_URL = process.env.HACKERRANK_BASE_URL || "https://www.hackerrank.com/x/api/v3";

function getApiKey(): string {
  const key = process.env.HACKERRANK_API_KEY;
  if (!key) {
    console.error("Error: HACKERRANK_API_KEY environment variable is required.");
    console.error("Generate one at: https://www.hackerrank.com/work/settings/token");
    process.exit(1);
  }
  return key;
}

async function request(path: string, params?: Record<string, string>): Promise<unknown> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const apiKey = getApiKey();
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`API error ${response.status}: ${body}`);
    process.exit(1);
  }

  return response.json();
}

// Tests

export async function listTests(limit = "20", offset = "0") {
  return request("/tests", { limit, offset });
}

export async function getTest(id: string) {
  return request(`/tests/${id}`, {
    additional_fields: "questions,sections,candidate_details,cutoff_score,languages,tags,role_ids,experience,sections_data",
  });
}

export async function listTestInviters(testId: string) {
  return request(`/tests/${testId}/inviters`);
}

// Candidates

export async function listCandidates(testId: string, limit = "20", offset = "0") {
  return request(`/tests/${testId}/candidates`, { limit, offset });
}

export async function getCandidate(testId: string, candidateId: string) {
  return request(`/tests/${testId}/candidates/${candidateId}`, {
    additional_fields: "questions,plagiarism,comments,performance_summary,integrity_status,integrity_summary,proctor_images,candidate_details,scores_tags_split,scores_skills_split,percentage_score",
  });
}

export async function searchCandidates(testId: string, search: string, limit = "20", offset = "0") {
  return request(`/tests/${testId}/candidates/search`, { search, limit, offset });
}

export async function getCandidatePdf(testId: string, candidateId: string) {
  return request(`/tests/${testId}/candidates/${candidateId}/pdf`, { format: "url" });
}

// Interviews

export async function listInterviews(limit = "20", offset = "0") {
  return request("/interviews", { limit, offset });
}

export async function getInterview(interviewId: string) {
  return request(`/interviews/${interviewId}`);
}

export async function getInterviewTranscript(interviewId: string) {
  return request(`/interviews/${interviewId}/transcript`);
}

// Questions

export async function listQuestions(limit = "20", offset = "0") {
  return request("/questions", { limit, offset });
}

export async function getQuestion(questionId: string) {
  return request(`/questions/${questionId}`);
}
