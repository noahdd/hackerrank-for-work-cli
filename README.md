# hackerrank-cli

Simple CLI to fetch interview and test results from [HackerRank for Work](https://www.hackerrank.com/work/).

## Setup

```bash
npm install
npm run build
```

### API Key

Generate a token at [HackerRank Settings > API](https://www.hackerrank.com/work/settings/token), then:

```bash
export HACKERRANK_API_KEY="your-api-key"
```

## Usage

```bash
# List tests
hackerrank tests

# Get test details
hackerrank tests <test_id>

# List candidates for a test
hackerrank candidates <test_id>

# Get a specific candidate's results (scores, answers, skills breakdown)
hackerrank candidates <test_id> <candidate_id>

# Search candidates by name or email
hackerrank candidates <test_id> --search "alice@example.com"

# Get candidate PDF report URL
hackerrank candidate-pdf <test_id> <candidate_id>

# List interviews
hackerrank interviews

# Get interview details
hackerrank interviews <interview_id>

# Get interview transcript
hackerrank transcript <interview_id>

# List questions
hackerrank questions

# Pagination
hackerrank tests --limit 50 --offset 0
```

Output is JSON, so you can pipe it:

```bash
hackerrank candidates <test_id> | jq '.data[] | {name: .full_name, score: .percentage_score}'
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HACKERRANK_API_KEY` | Yes | Your HackerRank for Work API key |
| `HACKERRANK_BASE_URL` | No | API base URL (default: `https://www.hackerrank.com/x/api/v3`) |

## License

MIT
