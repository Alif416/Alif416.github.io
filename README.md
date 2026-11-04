# Md Labibul Ahsan Alif: personal academic website

The source of the personal website of Md Labibul Ahsan Alif (Alif), a Computer Science graduate of BRAC University in Dhaka, Bangladesh. The live site is at **https://alif416.github.io/**.

It is one scrolling page with a sticky menu, light and dark themes, a small blog, and an RSS feed. It is built with Vite, React, and TypeScript, and it is a static site: there is no server and no database.

## Contents

1. [Quick start](#quick-start)
2. [How the project is laid out](#how-the-project-is-laid-out)
3. [Editing the site](#editing-the-site)
4. [The photo and the social card](#the-photo-and-the-social-card)
5. [Writing blog posts](#writing-blog-posts)
6. [Deploying](#deploying)
7. [Using your own domain](#using-your-own-domain)
8. [Analytics (optional, off)](#analytics-optional-off)
9. [Checks before you push](#checks-before-you-push)
10. [How it is built](#how-it-is-built)
11. [Troubleshooting](#troubleshooting)
12. [Credits](#credits)

## Quick start

You need [Node.js](https://nodejs.org/) version 22 or newer. The file `.nvmrc` says `22`, so if you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use` inside the project.

```bash
git clone https://github.com/Alif416/Alif416.github.io.git
cd Alif416.github.io
npm install
npm run dev
```

Then open the address that `npm run dev` prints (normally `http://localhost:5173/`). The page reloads when you save a file.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the site on your computer. Draft blog posts are visible here. |
| `npm run build` | Checks the types, checks every blog post, and builds the finished site into `dist/`. |
| `npm run preview` | Serves the finished site from `dist/` so you can look at exactly what will go live. Run `npm run build` first. |
| `npm run lint` | Runs the code checker (Oxlint). |

## How the project is laid out

```
src/data/content.ts      All the text and links on the site. You will edit this most.
src/data/types.ts        The shape of that data. TypeScript uses it to catch mistakes.
src/components/          The pieces of the page (hero, research, thesis, and so on).
src/index.css            Colours, fonts, spacing, and the light and dark themes.
content/blog/            Your blog posts, one Markdown file each.
public/                  Files served as they are: the photo, the social card, icons.
design/                  Two small helper pages for making images (see below).
vite-plugins/            Build-time code: blog posts, the feed, search tags, font preload.
.github/workflows/       The automatic deploy.
index.html               The page shell, including the script that stops the theme flash.
```

You can change the words and links without touching `src/components/`.

## Editing the site

Open `src/data/content.ts`. The file is plain text with comments. Save it, and `npm run dev` shows the change at once. If you make a mistake (for example text where a number is expected), the editor and `npm run build` tell you exactly where.

**Missing things are hidden.** A value of `null` hides that item, and an empty list (`[]`) hides that block. Nothing is shown until you provide it.

### What each field does

| Field | What it controls |
| --- | --- |
| `site.title` | The site's name, used in the feed and in link previews. |
| `site.pageTitle` | The text in the browser tab and in search results. |
| `site.description` | The one-sentence description for search results, link previews, and the feed. |
| `site.url` | The full address of the site, ending in `/`. It feeds the canonical link, the sitemap, the feed, and the link-preview tags. See [Using your own domain](#using-your-own-domain). |
| `person.name` | Your name: the main heading, the header, and the footer. |
| `person.shortName` | Used for the letter shown in place of the photo when there is no photo. |
| `person.location` | Not shown anywhere at the moment. The place name on the page is part of the bio text. |
| `person.headline` | The line under your name, also used in link previews and in the no-JavaScript fallback. |
| `person.researchStatement` | The larger sentence under the headline. |
| `person.bio` | The paragraph below the buttons. |
| `person.photo` | The photo (`src`, `alt`, `srcSet`, `sources`). Set it to `null` to show a letter in a circle instead. See [The photo and the social card](#the-photo-and-the-social-card). |
| `links.email` | Your email, stored in two parts (`user` and `domain`) so it can be assembled in the browser and kept out of the page source. Set to `null` to hide it everywhere. |
| `links.github`, `links.linkedin`, `links.scholar`, `links.orcid` | Profile links, shown as icons in the hero and as buttons in Contact. Each `null` is hidden. |
| `contact.intro` | An optional sentence above your email in the Contact section. `null` shows nothing. |
| `nav` | The section order, the menu label, and the heading of each section. You can change `label` and `heading`. Do not change `id`, because the code depends on those names. |
| `research` | The research interests, as a list of short names. They show as tags, in this order. |
| `thesis` | Shown inside the Research section, under the interests. `title`, `supervisor`, `year`, and the optional `abstract`, `pdfUrl`, and `codeUrl`. Each `null` is hidden. |
| `projects` | A list of projects (see the example below). |
| `projectsEmptyMessage` | The short line shown while `projects` is empty. |
| `education` | `university`, `degree`, `batch`, and `cgpa`. Only `university` is used on the site today (in the search-engine data). The degree and grade are not shown on the page. |
| `documents.cv` | The CV button in the hero: `label` and `url` (a Google Drive link). There is no transcript on the site. |

A few fixed labels are not in the data file. They live in the components: "Undergraduate thesis", "Supervised by", "RSS feed", "Back to Blog and Notes", "Skip to main content", "Post not found", and the button names for the menu and the theme switch.

### Add a project

Add an entry inside `projects`. Write only what is true.

```ts
projects: [
  {
    title: 'Example project',
    date: 'May 2026', // shown on the timeline, or null to hide it
    summary: 'One paragraph: the problem it solves and an honest result.',
    tech: ['Python', 'PyTorch'],
    githubUrl: 'https://github.com/your-name/example',
    demoUrl: null, // or a link, if there is a live demo
  },
],
```

Put the projects closest to your research first. Three to five is a good number. The page shows them as a timeline, in the order you write them, so put the date you want each one to carry in `date`.

### Add the thesis abstract and links

```ts
thesis: {
  title: 'Remote patient monitoring system driven by federated learning',
  supervisor: 'Mr. Moin Mostakim',
  year: 2026,
  abstract: 'A short abstract, in plain words.',
  pdfUrl: 'https://drive.google.com/file/d/.../view',
  codeUrl: 'https://github.com/your-name/thesis-code',
},
```

Describe the thesis as being "on" or "about" the topic, as it is today. Do not write that you built something you did not build.

### Other common edits

- **Contact sentence:** set `contact.intro` to a single sentence of your own.
- **Reorder research interests:** move the entries inside `research`.
- **Change a link:** replace the address. Keep the `https://` part.

Keep to these writing rules everywhere: no em-dashes or double dashes, nothing exaggerated, and no facts you cannot back up.

## The photo and the social card

The hero uses `public/photo.jpg` (420 pixels square) plus smaller copies, so phones download less:

| File | Size | Used for |
| --- | --- | --- |
| `public/photo.jpg` | 420 x 420 | The main file and the fallback for old browsers |
| `public/photo-384.webp`, `public/photo-192.webp` | 384 and 192 | Modern browsers (a few KB each) |
| `public/photo-384.jpg`, `public/photo-192.jpg` | 384 and 192 | Browsers without WebP |

### Replace the photo

1. Open `design/photo-sizes.html` in Chrome (double-click it, or drag it into a Chrome window).
2. Choose your new photo. A headshot with the face in the middle works best. Anything that is not square is cropped from the middle.
3. Click each of the five file names to download them.
4. Put the five files in `public/`, replacing the old ones. The names must stay exactly the same.
5. If the new photo has a different description, change `person.photo.alt` in `content.ts`.
6. Redraw the social card (next section).

Nothing is uploaded anywhere. The page works entirely in your browser.

### Redraw the social card

`public/social-card.png` is the image shown when someone shares your link in a chat or on a social site (1200 x 630 pixels). It is drawn from `design/social-card.html`.

1. If your name or headline changed, edit the text in `design/social-card.html` so it matches `content.ts`.
2. Open `design/social-card.html` in Chrome.
3. Open the developer tools (right-click, Inspect), click the element with class `card`, then right-click it in the tools and choose **Capture node screenshot**.
4. Save the result as `public/social-card.png`.

Chat and social sites keep old preview images for a while, so a changed card may take time to appear for links that were shared before.

## Writing blog posts

A post is one Markdown file in `content/blog/`. Push it to `main` and it appears on the site.

### The file name

The file name becomes the post's address: `my-first-note.md` is shown at `#/blog/my-first-note`. Use only lowercase letters, digits, and single hyphens.

### The top of the file

Every post starts with a block between two lines of three hyphens:

| Field | Needed? | Meaning |
| --- | --- | --- |
| `title` | Yes | The post title. |
| `date` | Yes | Written as `YYYY-MM-DD`, for example `2026-11-04`. It must be a real date. |
| `summary` | Yes | One or two plain sentences, shown in the list and in the feed. |
| `tags` | No | A list such as `[nlp, notes]`. Leave it out or use `[]` for none. |
| `readingTime` | No | Minutes. If you leave it out, it is worked out from the length (200 words a minute, at least 1). |
| `draft` | No | `true` keeps the post off the live site. |

### A complete example

Save this as `content/blog/my-first-note.md`:

````markdown
---
title: What I learned from my first experiment
date: 2026-11-04
tags: [notes, nlp]
summary: A short note about the first experiment I ran and what I would do differently.
---

Write the post here in ordinary Markdown.

## A heading

A paragraph with **bold**, *italic*, `inline code`, and a [link](https://example.com).

- A list item
- Another list item

```python
print("Code blocks are coloured automatically.")
```

![A short description of the image](/my-picture.png)
````

Images go in the `public/` folder and are written with a leading slash, like `/my-picture.png` above. They need a description (the text in the square brackets). The build stops with an error if it is missing. Code blocks are coloured when you build the site, and the language comes from the word after the three backticks. An unknown language is shown as plain code.

### Drafts and publishing

- A post with `draft: true` shows in `npm run dev` but **never** goes on the live site. Not its title, not its text, not its file name.
- To publish, delete the `draft: true` line and push.
- The two example posts that come with the project are drafts. They show how a post looks, and you can delete them.

### What visitors see

- Posts are listed newest first (posts with the same date are ordered by title).
- The **Blog and Notes** section and its menu link appear only once at least one post is published, so nobody ever sees an empty section.
- Each post has its own address starting with `#/blog/`. A link to a single post shows the site's normal preview card, not one made for that post.
- The RSS feed is at `/feed.xml` (for this site, https://alif416.github.io/feed.xml). It lists published posts only, with the summary of each. A small "RSS feed" link appears in the Blog section.

### When the build complains

A mistake in a post stops the build with a message that names the file, so a broken post can never go live. The live site stays as it was. Typical messages:

| Message (shortened) | Fix |
| --- | --- |
| `"title" is required` or `"date" is required` or `"summary" is required` | Add the missing line to the top of the file. |
| `"date" must be a real date in the format YYYY-MM-DD` | Write the date as `2026-02-28`, not `28 Feb` or `2026-02-30`. |
| `unknown frontmatter field "tag"` | Use only `title`, `date`, `tags`, `summary`, `readingTime`, and `draft`. |
| `the filename must use only lowercase letters, digits, and single hyphens` | Rename the file, for example `My_Note.md` to `my-note.md`. |
| `an image has no alt text` | Put a short description inside the square brackets of the image. |
| `"tags" must be a list` | Write tags as `[one, two]`. |

## Deploying

The site is published by GitHub Pages. You do not run any deploy command.

1. Commit your changes and push to the `main` branch.
2. GitHub Actions runs `.github/workflows/deploy.yml`. It installs the packages (`npm ci`), runs `npm run lint`, runs `npm run build`, and then publishes the `dist/` folder.
3. After a minute or two, the change is live at https://alif416.github.io/.

To watch a run, open the **Actions** tab of the repository on GitHub. You can also start a run by hand from that tab (the workflow has a manual trigger).

**If a run fails**, the live site is not changed: it keeps showing the last good version. Open the failed run, read the red step, fix the problem, and push again. Most failures are a blog post mistake (see above) or a TypeScript error in `content.ts`.

**To go back to an earlier version**, revert the commit that caused the problem (`git revert <commit>`) and push.

Deploys only work from `main`. GitHub's `github-pages` environment is set to accept `main` only, so a run started from another branch builds but is not allowed to publish.

In the repository settings, **Pages** must have **Source** set to **GitHub Actions** (it already is).

## Using your own domain

The site is built to move to a domain such as `www.example.com` with one change in `content.ts`.

**About the `CNAME` file.** Many guides tell you to add a file called `CNAME`. That is not needed here. This site is published by a GitHub Actions workflow, and GitHub says that for such sites no `CNAME` file is created, and any existing one is ignored. You set the domain in the repository settings instead. (If you ever publish from a branch instead of a workflow, GitHub adds the `CNAME` file for you.)

Steps, in this order:

1. **Buy the domain** from a registrar.
2. **Verify it with GitHub** (recommended, it stops others from claiming your domain): follow GitHub's guide, [Verifying your custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).
3. **Add the domain on GitHub first.** In the repository go to **Settings, Pages, Custom domain**, type the domain, and save. Do this before you change DNS. GitHub warns that doing it the other way round could let someone else host a site on your subdomain.
4. **Set DNS records** at your registrar:
   - For a `www` address: a `CNAME` record pointing `www` to `alif416.github.io`.
   - For the bare domain (`example.com`): four `A` records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`. You can also add the four `AAAA` records that GitHub lists for IPv6.
   - GitHub recommends setting up the `www` address even if you also use the bare domain, and then it redirects between the two.
   - Do not use wildcard records such as `*.example.com`.
5. **Wait.** DNS changes can take up to 24 hours. Check with `dig www.example.com +noall +answer`.
6. **Turn on HTTPS.** When GitHub offers it, tick **Enforce HTTPS** in **Settings, Pages**.
7. **Tell the site its new address.** Change `site.url` in `src/data/content.ts` to the address people will use, for example `'https://www.example.com/'`. Edit the line with the address at the bottom of `design/social-card.html` too, and redraw the social card.
8. Push. The canonical link, the link-preview tags, `sitemap.xml`, `robots.txt`, `feed.xml`, and the structured data all follow `site.url` by themselves. `base` in `vite.config.ts` stays `'/'`.

Use GitHub's own pages as the final word, because they change over time: [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Analytics (optional, off)

**This site has no analytics installed.** It sets no cookies and loads nothing from other companies. If you want to know how many people visit, you can add a privacy-friendly counter. You can also leave it off, which is the default.

### Add one

Services give you a snippet of one `<script>` line. As an example, [GoatCounter](https://www.goatcounter.com/) describes itself as a free, donation-supported, privacy-friendly service that works without cookies. After you create a free account and choose a code, its help page, [goatcounter.com/help/start](https://www.goatcounter.com/help/start), gives you this line, with your own code in place of `MYCODE`:

```html
<script data-goatcounter="https://MYCODE.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
```

Paste the line inside the `<head>` of `index.html`, then push. Other tools work the same way: copy the snippet they give you into the same place.

Read the tool's own terms and privacy information before you add it, and decide whether your visitors should be told. A short sentence in the page footer is the usual way, and that sentence would be yours to write.

### Remove it

Delete the line from `index.html` and push. Nothing else needs to change.

## Checks before you push

```bash
npm run lint
npm run build
npm run preview
```

`npm run build` is the important one: it checks the types in `content.ts` and every blog post. `npm run preview` shows the finished site, so you can look at it once before it goes live. GitHub Actions runs the install, the lint, and the build on every push, and will not publish if any of them fails.

## How it is built

- **Vite, React, and TypeScript.** The page is built from small components. The text is in `src/data/content.ts`.
- **Static hosting.** The build produces plain files in `dist/`. GitHub Pages serves them. There is no server, no database, and no login.
- **One page with hash addresses.** GitHub Pages cannot rewrite web addresses, so blog posts use addresses such as `#/blog/my-first-note`, and sections use `#research`. This is why a shared link to a post shows the general site preview.
- **Blog posts are processed at build time.** A small plugin in `vite-plugins/markdown.ts` reads the Markdown files, checks them, turns them into HTML, and colours the code, so none of that work happens in the visitor's browser. Each post is loaded only when it is opened. Drafts are removed completely from the live build.
- **Search and sharing tags are generated.** `vite-plugins/seo.ts` writes the title, description, link-preview tags, structured data, a short no-JavaScript fallback, `robots.txt`, and `sitemap.xml` from `content.ts`.
- **The theme** follows the visitor's system setting, remembers their choice, and is set before the first paint so the page never flashes the wrong theme.
- **Fonts** are Source Serif 4 and Inter, served from the site itself (no request to any font host).
- **The email address** is put together in the browser from two parts, so it is not in the page source.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `npm install` or `npm run build` complains about the Node version | Run `node -v`. You need 22 or newer. With nvm, run `nvm use`. |
| `npm run build` fails with `Blog post "..."` | A post has a problem. The message names the file and the fix. See the table under [Writing blog posts](#writing-blog-posts). |
| TypeScript error in `content.ts` | A value has the wrong kind: for example `year` must be a number (`2026`), and text needs quotes. The error shows the line. |
| A post shows in `npm run dev` but not on the live site | It has `draft: true`. Remove that line to publish. |
| The Blog section is missing | It appears only when at least one post is published. Check that no post has `draft: true`. |
| A post link shows "Post not found" | The address is wrong, or the post is a draft. Addresses look like `#/blog/file-name-without-md`. |
| The live site did not change after a push | Open the **Actions** tab and look at the latest run. If it is green, wait a minute and reload with the cache cleared. If it is red, read the failing step. Also check that **Settings, Pages, Source** is **GitHub Actions**. |
| A deploy run from a branch builds but does not publish | Expected. Only `main` can publish. |
| The email address is not visible | It is assembled by JavaScript on purpose. With JavaScript turned off, only the profile links show. |
| The photo looks cropped or off-centre | The photo is shown in a circle, cropped from the middle. Use a square photo with the face in the centre, and make the files again with `design/photo-sizes.html`. |
| A shared link shows an old preview image | Chat and social sites cache previews. Wait, or share the link again later. |
| `feed.xml` has no items | There are no published posts yet. |
| Changing `site.url` did not change the preview card text | The card is an image. Redraw `public/social-card.png` (see above). |

## Credits

- Fonts: [Source Serif 4](https://github.com/adobe-fonts/source-serif) and [Inter](https://rsms.me/inter/), both under the SIL Open Font License 1.1, installed from [Fontsource](https://fontsource.org/).
- Code colouring at build time: [Shiki](https://shiki.style/). Markdown: [marked](https://marked.js.org/).
- Built with [Vite](https://vite.dev/) and [React](https://react.dev/).
