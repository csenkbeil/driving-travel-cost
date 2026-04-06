---
name: svelte-sveltekit-code-review
description: Review Svelte and SvelteKit codebases for formatting consistency, coding style, excessive nesting in functions or component logic, unused variables, test coverage, test quality, and security issues. Use when Codex needs to perform a code review of a Svelte or SvelteKit app and write the findings to doc/code_review.md.
---

# Svelte SvelteKit Code Review

Perform a repository review focused on maintainability, test health, and security, then write the findings to `doc/code_review.md`.

## Workflow

1. Inspect the app before judging it.
   Identify whether the repo uses Svelte or SvelteKit, the Svelte version, the routing model, the styling approach, and any linting, formatting, type-checking, or test tools already configured.
2. Review against project rules first.
   Read `package.json`, formatter configs, linter configs, test configs, coverage settings if present, and any contributor docs before deciding that a pattern is wrong.
3. Prioritize real findings.
   Focus on concrete defects, risky patterns, inconsistent formatting, maintainability issues from deeply nested logic, unused code or variables that hide intent, weak or missing tests, and security concerns that affect behavior or future change cost.
4. Keep the review evidence-based.
   Cite file paths and line numbers for every finding. Avoid vague style commentary with no code reference.
5. Write the review to `doc/code_review.md`.
   Replace the file contents with the latest review so the document reflects the current pass.

## Review Focus

- Check formatting consistency against configured tools such as Prettier, ESLint, or repo-specific standards.
- Check coding style for clarity, idiomatic Svelte/SvelteKit usage, naming consistency, component responsibility, and unnecessary complexity.
- Check for unused variables, imports, props, stores, helper functions, branches, or dead reactive state when they add noise or suggest incomplete refactors.
- Check for over-nesting in functions, reactive blocks, event handlers, loaders, and component scripts. Flag logic that should be extracted into helpers, stores, modules, or smaller components.
- Check tests for meaningful coverage of critical behaviors, edge cases, failure paths, and regression-prone logic. Note important untested areas when the absence of coverage raises risk.
- Check whether tests are appropriately coded: readable setup, stable assertions, correct async handling, low brittleness, appropriate mocking, and alignment between test names and behavior under test.
- Check for security issues including unsafe HTML rendering, client exposure of secrets, weak handling of auth/session data, unsanitized URL or query param usage, insecure server endpoints, and trust of unvalidated input.
- Treat accessibility or performance issues as secondary unless they directly create security or maintainability risk.

## Output Format

Write `doc/code_review.md` with these sections in order:

1. `# Code Review`
2. `## Scope`
3. `## Findings`
4. `## Open Questions`
5. `## Summary`

In `## Findings`, list issues from highest to lowest severity. For each finding include:

- Severity label: `Critical`, `High`, `Medium`, or `Low`
- File reference with line numbers
- Short title
- Why it matters
- Recommended fix

If no issues are found, state that explicitly in `## Findings` and still note any residual risk or testing gaps.

In `## Scope`, note the review inputs you used, including whether test files, test config, and coverage signals were present.

## Delivery Rules

- Prefer concise prose over long audits.
- Do not invent style rules that are not supported by the repository.
- Distinguish between confirmed issues and reasonable inferences.
- Call out missing or weak tests when they make a finding harder to validate or increase regression risk.
- Treat absent coverage reports as a gap in evidence, not proof that coverage is poor; infer carefully from the test suite and changed risk areas.
- Use [references/review-checklist.md](./references/review-checklist.md) while reviewing.
