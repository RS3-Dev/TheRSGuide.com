# Testing strategy

The test suite is organized around risks and shared behavior rather than source
file counts. A test should protect something that could break for a visitor,
content author, or deployment without making routine content growth harder.

This document describes the intended structure. It deliberately avoids listing
the current number of test files or test cases because those totals will change.

## Principles

1. Test stable contracts, not the current size of the site.
2. Discover content and structured data automatically.
3. Test components through visible, accessible behavior with small fixtures.
4. Keep detailed edge cases around domain rules and external boundaries.
5. Let production validation reject malformed published content.

For example, a table test may verify that search hides a nonmatching fixture
row and keeps a matching row visible. It should not assert that a production
table has a particular number of rows.

## Test layers

### Content and build contracts

Shared contract tests discover all MDX files. They verify that every guide can
compile and load and that custom components used by authored MDX are registered.
The guide-content build also validates required frontmatter, route uniqueness,
navigation metadata, and mode-specific publication rules.

This replaces one smoke test per guide. Adding a new MDX file automatically
places it under the same contract without adding another test file.

Published content errors should stop a production build with the source path in
the error. Development and unit-test workflows can still load content that is
missing publication-only metadata, such as a description, where appropriate.

### Structured data contracts

JSON-backed data tables are discovered and validated through the shared schema
in `schemas/data-table.schema.json`. Validation covers both shape and semantic
rules, including:

- supported table and column options;
- unique column keys;
- required displayed values on each row;
- present and unique configured row IDs; and
- valid link-field references.

The production data is checked as one collection. Validator tests use small
invalid fixtures to prove that useful failures are reported. Tests should not
copy production data or record its current row totals.

Runtime validation remains in the `DataTable` component so malformed data does
not crash a page if it reaches the browser. Build validation is the primary
authoring safeguard.

### Component behavior

Interactive component tests use Testing Library and query the rendered page by
accessible role, name, label, or visible text. Small fixtures keep the expected
behavior easy to understand.

Useful component tests cover behavior such as:

- a control expands or dismisses something;
- search and sorting change what the visitor sees;
- links have the intended destination and external-link behavior;
- loading and error states are announced accessibly; and
- invalid input produces a safe fallback.

Server-rendered markup tests are acceptable for noninteractive adapters or
rendering paths where browser interaction is irrelevant. Prefer semantic DOM
queries when the behavior is interactive.

Avoid assertions against incidental CSS classes, complete HTML strings, or
large snapshots unless those exact details are the public contract.

### Domain logic

Pure application logic is tested with representative examples and edge cases.
This includes guide search and navigation, quest dependency traversal, player
profile normalization, privacy preferences, event countdowns, and saved picker
state.

These tests can be more detailed than rendering tests because the rules are the
product behavior. Important cases include invalid input, migrations from older
saved formats, conflicting state, asynchronous results arriving out of order,
and boundary dates.

Do not create a test only to execute every function or mirror its implementation.
Each case should explain a rule or failure mode that matters.

### Server boundaries

Server endpoint tests treat upstream services as boundaries. Network calls are
stubbed so the suite remains deterministic and does not depend on RuneMetrics,
Discord, Cloudflare, or the share service being available.

Endpoint coverage should normally include:

- invalid methods, paths, origins, or payloads;
- one representative successful upstream response;
- stable behavior when the upstream service fails; and
- important response headers, caching, and status codes.

The tests should verify the contract presented by this repository rather than
retesting the upstream service.

### Browser-level tests

There is no route-by-route end-to-end suite. Compiling every guide, testing
shared components, and validating route metadata provide more durable coverage
than opening every route in a browser.

If browser automation is added, reserve it for a few critical journeys that
cannot be represented reliably at a lower layer, such as navigating to a guide,
using a major interactive tool, or recovering from a failed request.

## File organization

Tests are normally colocated with the code they protect:

- `src/**/*.test.ts` for domain and browser-independent application logic;
- `src/**/*.test.tsx` for rendered React behavior;
- `server/*.test.mjs` for HTTP boundaries; and
- `scripts/*.test.mjs` for build and validation tools.

Cross-cutting content contracts can live near the source root because they
discover many files rather than belonging to one component. Shared test setup
belongs in `src/test` and should remain small.

A test file does not need to exist for every production file. Create one when a
module owns meaningful behavior or a boundary worth protecting.

## Choosing tests for a change

### Guide or navigation change

Usually no new test is needed. The shared MDX and metadata contracts discover
the change automatically. Add a focused test only when introducing a new
content rule or custom component behavior.

### Data-only table change

Usually no new test is needed. Schema and semantic validation cover the data.
Add or change a component test only when the table's reusable behavior changes.

### Component change

Test the visitor-visible outcome with a minimal fixture. Cover the main
interaction and a meaningful fallback or accessibility state when relevant.

### Domain-rule change

Add representative cases for the new rule and its important boundaries. Prefer
small explicit inputs over production datasets.

### Server change

Cover request validation, a successful response, and upstream failure in
proportion to the risk of the endpoint.

## Commands

Run the complete unit and contract suite with:

```bash
npm test
```

Run a focused file while developing with:

```bash
npx vitest run path/to/example.test.ts
```

Before merging a code or configuration change, also run:

```bash
npm run lint
npm run build
```

The build is part of the strategy: it validates published guide metadata and
structured table data in addition to compiling the application.

## Review checklist

When reviewing a test change, ask:

- Does the test describe a visitor-visible behavior, domain rule, or boundary?
- Will it still pass when ordinary guides, rows, or data points are added?
- Is automatic discovery more appropriate than another per-file test?
- Does it use the smallest fixture that demonstrates the behavior?
- Is the same contract already covered at another layer?
- Will a failure explain what broke and where to fix it?

The goal is not the smallest possible suite or the highest possible test count.
The goal is a suite that catches meaningful regressions while staying easy to
change alongside the site.
