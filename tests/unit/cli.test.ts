import { describe, it, expect } from "vitest";

// Test the arg parser directly
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

describe("CLI argument parsing", () => {
  it("parses bare command", () => {
    const { positional, flags } = parseArgs(["tests"]);
    expect(positional).toEqual(["tests"]);
    expect(flags).toEqual({});
  });

  it("parses command with positional arg", () => {
    const { positional, flags } = parseArgs(["tests", "abc123"]);
    expect(positional).toEqual(["tests", "abc123"]);
    expect(flags).toEqual({});
  });

  it("parses command with two positional args", () => {
    const { positional, flags } = parseArgs(["candidates", "test1", "cand1"]);
    expect(positional).toEqual(["candidates", "test1", "cand1"]);
    expect(flags).toEqual({});
  });

  it("parses --limit and --offset flags", () => {
    const { positional, flags } = parseArgs(["tests", "--limit", "50", "--offset", "10"]);
    expect(positional).toEqual(["tests"]);
    expect(flags).toEqual({ limit: "50", offset: "10" });
  });

  it("parses --search flag", () => {
    const { positional, flags } = parseArgs(["candidates", "test1", "--search", "alice"]);
    expect(positional).toEqual(["candidates", "test1"]);
    expect(flags).toEqual({ search: "alice" });
  });

  it("parses --help as boolean flag", () => {
    const { positional, flags } = parseArgs(["--help"]);
    expect(positional).toEqual([]);
    expect(flags).toEqual({ help: "true" });
  });

  it("handles mixed positional and flags", () => {
    const { positional, flags } = parseArgs(["candidates", "test1", "--limit", "5", "--search", "bob"]);
    expect(positional).toEqual(["candidates", "test1"]);
    expect(flags).toEqual({ limit: "5", search: "bob" });
  });
});
