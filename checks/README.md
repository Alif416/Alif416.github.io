# Checks

Run `npm run check` to build the site and run every check. It needs Google Chrome and Node 22.18 or newer.

| Command | What it does |
| --- | --- |
| `npm run check` | Builds the site and a copy with drafts visible, then runs every group. About five minutes. |
| `npm run check -- --quick` | The main groups only. |
| `npm run check -- --suite blog` | One group (build, shell, content, blog, photo, copy, accessibility, responsive). |
| `npm run check -- --url https://alif416.github.io/` | Checks a live address. Groups that need draft posts are skipped. |
| `npm run check -- --no-build` | Reuses the last build. |

Expected text is read from `src/data/content.ts` and `content/blog/`, so editing your content does not break the checks. A failure says what was expected and what was found. If Chrome is not found, set `CHROME_PATH`.

Lighthouse is not included. Run it with `npx lighthouse https://alif416.github.io/ --view`.
