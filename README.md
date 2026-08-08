# The RS Guide

The RS Guide is a community-built collection of practical RuneScape guides. Most
of the site is written as text files, so you do not need to be a programmer to
help improve it.

You can contribute by:

- correcting outdated or inaccurate information;
- fixing spelling, grammar, or unclear wording;
- adding examples, images, or useful details; or
- improving the website itself.

We kindly ask contributors not to add entirely new guides. Instead, please work
within the existing scaffolded guides. Corrections, clearer wording, updated
information, and other improvements to those guides are all welcome. If you
think the site needs a guide that does not exist yet, open an issue so we can
discuss where it belongs before any work begins.

## AI contributions

AI-assisted contributions are allowed for code changes and bug fixes. If you use
AI for code, you are still responsible for understanding the changes, reviewing
them for correctness and security, testing them where possible, and clearly
explaining what the contribution does.

AI must not be used to write, rewrite, or expand guide content. This includes
instructions, explanations, examples, descriptions, and other prose presented
to readers. Content created wholly or partially with AI will be rejected
immediately, even if it has been edited afterward. All guide content must be
written and verified by a human contributor.

## The easiest way to help

If you have found a problem but do not want to edit a file, [open a GitHub
issue](https://github.com/RS3-Dev/TheRSGuide.com/issues). Tell us which guide is
affected, what should change, and include a source or screenshot if it would be
helpful.

That is a complete contribution. You do not need to fix the problem yourself.

## Editing a guide on GitHub

Small content changes can be made entirely in your browser:

1. Open the [`content`](content/) folder.
2. Find the guide you want to update and open its `.mdx` file.
3. Select the pencil icon near the top of the file.
4. Make your changes.
5. Select **Commit changes** and follow GitHub's prompts to propose the update.

GitHub may create a personal copy of the repository, called a *fork*, for you.
It will then help you open a *pull request*, which is simply a request for us to
review and merge your changes.

For larger changes, new guides, or local previews, read
[CONTRIBUTING.md](CONTRIBUTING.md). It walks through the full process and links
to short references for MDX, page ordering, and the components available in
guides.

## Previewing the site on your computer

This is optional for small writing fixes. You will need
[Node.js](https://nodejs.org/) and Git installed.

After downloading your fork and opening the project folder in a terminal, run:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The page refreshes as you save
changes.

Before opening a pull request, run as many of these checks as you can:

```bash
npm run lint
npm test
npm run build
```

If you cannot run a check or do not understand an error, mention that in your
pull request. We can help.

## How testing works

We do not create a separate test for every guide or every row in a table.
Instead, a few shared checks make sure all guide files can load and that common
data follows the expected format. Other tests cover reusable website features,
such as search, navigation, interactive tools, and server requests.

Tests should focus on what a visitor can see or do and on rules that must remain
true. They should generally not depend on the exact number of guides, table
rows, or data points, because those totals naturally change as the site grows.
This means most ordinary guide and table updates are checked automatically
without requiring a new test.

Maintainers can read the more detailed [testing strategy](docs/testing.md).

## How guide content works

Guides live in the [`content`](content/) folder as `.mdx` files. MDX is mostly
regular Markdown with the option to use a few existing components for things
like cards and interactive tools.

Every guide begins with a title and short description:

```mdx
---
title: Example Guide
description: A short summary of what this guide covers
---

Write the guide here using regular Markdown.
```

The `meta.json` file in each folder controls the order in which its pages appear
in the site navigation. The detailed content references are collected in
[CONTRIBUTING.md](CONTRIBUTING.md#documentation).

## Project structure

- `docs/` - technical references for maintainers
- `content/` — guide pages and navigation files
- `public/` — images and other public files
- `src/` — website components, styles, and interactive tools
- `scripts/` — content validation and build utilities
- `server/` — server-side endpoints

## Maintainer and deployment notes

The production site is built with Vite:

```bash
npm run build
npm start
```

`npm start` serves the compiled site, supports direct links to guide pages, and
exposes `/api/player/:username` for RuneMetrics requests. Set `PORT` to change
the default port of `4173`.

The following environment variables are used by production deployments:

- `DISCORD_FEEDBACK_WEBHOOK_URL` enables the settings dialog's feedback form.
  The value remains on the server and is not included in the browser bundle.
- `SITE_URL` sets the base URL used for absolute page and social metadata URLs.
  If it is not present, the site uses `COOLIFY_URL` and then the incoming request
  origin.
- `VITE_DEPLOYMENT_ROLE=failover` shows a dismissible traffic notice at the top
  of every page. Use `primary` (or leave it unset) on the primary deployment.
  Changing this value requires rebuilding the application.
- `VITE_HOMEPAGE_MODE=leagues` enables the Leagues content, adds it to the
  homepage, navbar, sidebar, routes, and search, and shows the countdown on the
  homepage. Leave it unset or use `normal` to keep all Leagues content hidden
  without deleting its source files.
- `VITE_LEAGUES_START_DATE` and `VITE_LEAGUES_END_DATE` control the Leagues
  countdown. Use ISO-8601 values with an explicit timezone, preferably UTC
  (`Z`). Changing either value requires rebuilding the application.

Example countdown values:

```bash
VITE_LEAGUES_START_DATE=2026-08-10T12:00:00Z
VITE_LEAGUES_END_DATE=2026-09-10T12:00:00Z
```

The end date above is only an example. Deployment configuration should use the
actual event dates.

<img width="492" height="780" alt="image" src="https://github.com/user-attachments/assets/1f3c41f4-39ff-418b-b81a-a5a3cebe301f" />
