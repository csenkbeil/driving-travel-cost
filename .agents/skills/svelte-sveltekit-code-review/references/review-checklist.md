# Review Checklist

## Repository Baseline

- Read `package.json` and detect the framework, scripts, linting tools, formatter, type-checking, and test setup.
- Read Svelte or SvelteKit config files before judging conventions.
- Read test runner config, coverage config, and helper setup files if present.
- Read `README.md` or contributor docs for local standards.

## Formatting And Style

- Check whether formatting appears aligned with configured Prettier or ESLint rules.
- Check for mixed quoting, inconsistent semicolon usage, unstable import ordering, or formatting drift only when the repo clearly expects consistency.
- Check whether components are doing too many jobs or mixing server and client concerns poorly.
- Check whether reactive statements, derived state, and event handlers remain readable.
- Check for unused variables, imports, props, stores, helper functions, or dead state left behind by incomplete refactors.

## Excessive Nesting

- Flag functions with many nested conditionals, loops, or callbacks when extraction would materially improve clarity.
- Flag deeply nested async flow in `load`, form actions, endpoints, hooks, and component scripts.
- Prefer targeted refactors such as extracting pure helpers, stores, modules, or child components.

## Tests

- Identify the test frameworks, test file layout, and any configured coverage thresholds or reports.
- Check whether critical flows, failure paths, and edge cases have tests, especially around business logic, state transitions, form handling, and server behavior.
- Check whether tests assert behavior rather than implementation details unless implementation coupling is intentional.
- Check for brittle tests caused by excessive mocking, snapshot overuse, timing sensitivity, DOM structure coupling, or weak selectors.
- Check async tests for proper awaiting, settled state handling, cleanup, and deterministic expectations.
- Check that test names describe the behavior under test and that arrange-act-assert structure is reasonably clear.
- Note when coverage appears absent or insufficient for risky areas, but avoid claiming exact coverage percentages unless the repository provides them.

## Security

- Check for `{@html}` or raw HTML injection without strong sanitization.
- Check for direct trust of `URLSearchParams`, form input, request bodies, cookies, headers, and local storage data.
- Check for secrets or privileged tokens exposed to client code or public environment variables.
- Check server endpoints and actions for missing validation, authorization, or method restrictions.
- Check redirects and external links for unsafe user-controlled destinations.
- Check fetch or API calls for unsafely interpolated paths, headers, or query values.

## Findings Standard

- Prefer fewer, stronger findings over a long list of weak nits.
- Include precise file and line references for every finding.
- Separate confirmed issues from assumptions or missing-context concerns.
- Call out testing gaps separately when they materially affect confidence in behavior.
