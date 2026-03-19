#!/usr/bin/env node

import {
  listTests,
  getTest,
  listCandidates,
  getCandidate,
  searchCandidates,
  getCandidatePdf,
  listInterviews,
  getInterview,
  getInterviewTranscript,
  getInterviewCode,
  listQuestions,
  getQuestion,
} from "./client.js";

const USAGE = `Usage: hackerrank <command> [args]

Commands:
  tests                              List all tests
  tests <id>                         Get test details
  candidates <test_id>               List candidates for a test
  candidates <test_id> <candidate_id>  Get candidate result details
  candidates <test_id> --search <q>  Search candidates by name/email
  candidate-pdf <test_id> <candidate_id>  Get candidate PDF report URL
  interviews                         List all interviews
  interviews <id>                    Get interview details
  transcript <interview_id>          Get interview transcript
  code <interview_id>                Get candidate's final code (last frame)
  code <interview_id> --run <n>      Get code from a specific run (0-indexed)
  questions                          List all questions
  questions <id>                     Get question details

Options:
  --limit <n>     Number of results (default: 20, max: 100)
  --offset <n>    Pagination offset (default: 0)
  --run <n>       Specific run index for code command (default: last frame)
  --help          Show this help

Environment:
  HACKERRANK_API_KEY    Your HackerRank for Work API key (required)
  HACKERRANK_BASE_URL   API base URL (default: https://www.hackerrank.com/x/api/v3)
`;

function parseArgs(args: string[]) {
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "true";
      flags[key] = value;
    } else {
      positional.push(args[i]);
    }
  }

  return { positional, flags };
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const command = positional[0];

  if (!command || flags.help) {
    console.log(USAGE);
    process.exit(0);
  }

  const limit = flags.limit || "20";
  const offset = flags.offset || "0";
  let result: unknown;

  switch (command) {
    case "tests":
      result = positional[1]
        ? await getTest(positional[1])
        : await listTests(limit, offset);
      break;

    case "candidates":
      if (flags.search) {
        result = await searchCandidates(positional[1], flags.search, limit, offset);
      } else if (positional[2]) {
        result = await getCandidate(positional[1], positional[2]);
      } else if (positional[1]) {
        result = await listCandidates(positional[1], limit, offset);
      } else {
        console.error("Error: test_id is required. Usage: hackerrank candidates <test_id>");
        process.exit(1);
      }
      break;

    case "candidate-pdf":
      if (!positional[1] || !positional[2]) {
        console.error("Usage: hackerrank candidate-pdf <test_id> <candidate_id>");
        process.exit(1);
      }
      result = await getCandidatePdf(positional[1], positional[2]);
      break;

    case "interviews":
      result = positional[1]
        ? await getInterview(positional[1])
        : await listInterviews(limit, offset);
      break;

    case "transcript":
      if (!positional[1]) {
        console.error("Usage: hackerrank transcript <interview_id>");
        process.exit(1);
      }
      result = await getInterviewTranscript(positional[1]);
      break;

    case "code":
      if (!positional[1]) {
        console.error("Usage: hackerrank code <interview_id> [--run <n>]");
        process.exit(1);
      }
      result = await getInterviewCode(
        positional[1],
        flags.run !== undefined ? parseInt(flags.run) : undefined,
      );
      break;

    case "questions":
      result = positional[1]
        ? await getQuestion(positional[1])
        : await listQuestions(limit, offset);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.log(USAGE);
      process.exit(1);
  }

  console.log(JSON.stringify(result, null, 2));
}

main();
