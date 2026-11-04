// The blog: the list, the post pages, the address routing, and the rule that drafts never
// reach visitors. What is expected comes from the Markdown files in content/blog.

import { openPage, sleep } from '../lib/browser.mjs'

const readableDate = (date) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T00:00:00Z'))
const countMatches = (text, re) => (text.match(re) ?? []).length

export default async function (ctx, { ok, skip }) {
  const { content, expected, base, posts } = ctx
  const shown = expected.visible
  const draftSlugs = posts.filter((p) => p.draft).map((p) => p.slug)

  // ---- Drafts and the empty case
  if (!expected.hasBlog) {
    const { page, close } = await openPage(ctx.browser, base)
    const d = await page.evaluate(() => ({ blog: !!document.getElementById('blog'), link: !!document.querySelector('.site-nav__list a[href="#blog"]'), text: document.body.innerText }))
    ok('there is nothing to show, so the Blog section and its menu link are hidden', !d.blog && !d.link)
    ok('no "coming soon" or TODO line stands in for the missing blog', !/Notes are being added|TODO/.test(d.text))
    await close()
  }
  for (const slug of ctx.variant === 'prod' ? draftSlugs : []) {
    const { page, errors, close } = await openPage(ctx.browser, `${base}#/blog/${slug}`)
    await sleep(400)
    const nf = await page.evaluate(() => ({ h1: [...document.querySelectorAll('h1')].map((h) => h.textContent).join(), body: !!document.querySelector('.post__body'), back: document.querySelector('.post__back')?.textContent.replace(/\s+/g, ' ').trim(), href: document.querySelector('.post__back')?.getAttribute('href') }))
    ok(`the address of the draft "${slug}" shows "Post not found", never the draft`, nf.h1 === 'Post not found' && !nf.body, JSON.stringify(nf))
    ok('the back link on that page leads somewhere that exists', expected.hasBlog ? nf.href === '#blog' && /Back to Blog and Notes$/.test(nf.back) : nf.href === '#about' && /Back to the home page$/.test(nf.back), `${nf.back} ${nf.href}`)
    ok('no console errors on the not-found page', errors.length === 0, errors.join(' | '))
    await close()
  }
  {
    const { page, close } = await openPage(ctx.browser, `${base}#/blog/this-post-does-not-exist`)
    await sleep(300)
    const nf = await page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent, title: document.title, main: document.querySelectorAll('main').length }))
    ok('an address that matches no post shows "Post not found" with a page title, inside the normal page frame', nf.h1 === 'Post not found' && /^Post not found \| /.test(nf.title) && nf.main === 1, nf.title)
    await close()
  }

  if (!expected.hasBlog) {
    skip('the list and post-page checks', 'no post is shown on this build (publish a post, or see the drafts build)')
    return
  }

  // ---- The list
  {
    const { page, errors, close } = await openPage(ctx.browser, base)
    const list = await page.evaluate(() => [...document.querySelectorAll('#blog .blog-post')].map((li) => ({ title: li.querySelector('h3 a')?.textContent, href: li.querySelector('h3 a')?.getAttribute('href'), dt: li.querySelector('time')?.getAttribute('datetime'), dateText: li.querySelector('time')?.textContent, meta: li.querySelector('.blog-post__meta')?.textContent.replace(/\s+/g, ' '), summary: li.querySelector('.blog-post__summary')?.textContent, tags: [...li.querySelectorAll('.blog-post__tags li')].map((t) => t.textContent), tagList: !!li.querySelector('.blog-post__tags'), linkH: Math.round(li.querySelector('h3 a').getBoundingClientRect().height) })))
    ok(`the list shows the ${shown.length} post(s) newest first, with ties ordered by title`, JSON.stringify(list.map((i) => i.title)) === JSON.stringify(shown.map((p) => p.title)), list.map((i) => i.title.slice(0, 20)).join(' > '))
    ok('each item links to its own #/blog/ address', list.every((i, n) => i.href === `#/blog/${shown[n].slug}`))
    ok('each item shows a machine-readable date, a readable date, and the reading time', list.every((i, n) => i.dt === shown[n].date && i.dateText === readableDate(shown[n].date) && i.meta.includes(`${shown[n].readingTime} min read`)))
    ok('each item shows its summary and tags, and an item with no tags shows no tag row', list.every((i, n) => i.summary === shown[n].summary && JSON.stringify(i.tags) === JSON.stringify(shown[n].tags) && i.tagList === shown[n].tags.length > 0))
    ok('every title link is at least 44px tall', list.every((i) => i.linkH >= 44))
    const feedLink = await page.evaluate(() => { const a = document.querySelector('.blog__feed a'); return a ? { href: a.getAttribute('href'), h: Math.round(a.getBoundingClientRect().height) } : null })
    ok('an "RSS feed" link to /feed.xml is shown, at least 44px tall', feedLink?.href === '/feed.xml' && feedLink.h >= 44, JSON.stringify(feedLink))
    ok('no console errors on the list', errors.length === 0, errors.join(' | '))
    await close()
  }

  // ---- Post pages (the first few posts)
  for (const post of shown.slice(0, 3)) {
    const { page, errors, close } = await openPage(ctx.browser, `${base}#/blog/${post.slug}`, { wait: '.post__body' })
    await sleep(300)
    const d = await page.evaluate(() => {
      const b = document.querySelector('.post__body')
      return {
        h1: [...document.querySelectorAll('h1')].map((h) => h.textContent), focus: document.activeElement?.id, scroll: scrollY,
        dt: document.querySelector('.post time')?.getAttribute('datetime'), meta: document.querySelector('.post__meta')?.textContent.replace(/\s+/g, ' '),
        tags: [...document.querySelectorAll('.post__tags li')].map((t) => t.textContent), title: document.title,
        h2: b.querySelectorAll('h2').length, pre: [...b.querySelectorAll('pre')].map((p) => p.classList.contains('shiki')), preFocusable: [...b.querySelectorAll('pre')].every((p) => p.getAttribute('tabindex') === '0'),
        tables: b.querySelectorAll('.table-wrap').length, tableFocus: [...b.querySelectorAll('.table-wrap')].every((w) => w.getAttribute('tabindex') === '0' && w.getAttribute('role') === 'region'),
        images: [...b.querySelectorAll('img')].map((i) => ({ alt: i.alt, lazy: i.loading, fits: i.getBoundingClientRect().width <= b.getBoundingClientRect().width + 1 })),
        external: [...b.querySelectorAll('a[href^="http"]')].map((a) => ({ t: a.target, r: a.rel })), scripts: b.querySelectorAll('script').length,
        hs: document.documentElement.scrollWidth <= innerWidth, home: !!document.getElementById('research'), headingsSkip: [...document.querySelectorAll('main h1, main h2, main h3, main h4')].map((h) => +h.tagName[1]),
        fontSize: getComputedStyle(b).fontSize, family: getComputedStyle(b).fontFamily,
      }
    })
    const T = `post "${post.slug}"`
    ok(`${T}: opens with the title as the only h1, focus on it, at the top, home sections gone`, d.h1.length === 1 && d.h1[0] === post.title && d.focus === 'post-title' && d.scroll === 0 && !d.home, JSON.stringify([d.h1, d.focus, d.scroll]))
    ok(`${T}: date, reading time, and tags come from the file`, d.dt === post.date && d.meta.includes(readableDate(post.date)) && d.meta.includes(`${post.readingTime} min read`) && JSON.stringify(d.tags) === JSON.stringify(post.tags))
    ok(`${T}: the page title is "post title | name"`, d.title === `${post.title} | ${content.person.name}`, d.title)
    const h2InFile = countMatches(post.body, /^## /gm) + countMatches(post.body, /<h2[\s>]/g)
    ok(`${T}: the body has the ${h2InFile} second-level heading(s) in the file (Markdown or HTML), and heading levels never skip`, d.h2 === h2InFile && d.headingsSkip.every((n, i, a) => i === 0 || n - a[i - 1] <= 1))
    const fences = countMatches(post.body, /^```/gm) / 2
    ok(`${T}: the ${fences} code block(s) in the file are all shown, can be focused with the keyboard, and known languages are coloured at build time`, d.pre.length === fences && d.preFocusable && (fences === 0 || d.pre.filter(Boolean).length === countMatches(post.body, /^```(python|typescript|javascript|bash|json|html|css|ts|js|sh|yaml)/gm)), `${d.pre.filter(Boolean).length} of ${d.pre.length} coloured`)
    ok(`${T}: the ${countMatches(post.body, /^\|[\s:|-]+\|$/gm)} table(s) in the file are in scrollable regions`, d.tables === countMatches(post.body, /^\|[\s:|-]+\|$/gm) && d.tableFocus)
    ok(`${T}: every image has alt text, is lazy loaded, and fits the column`, d.images.length === countMatches(post.body, /!\[/g) && d.images.every((i) => i.alt && i.lazy === 'lazy' && i.fits))
    ok(`${T}: links to other sites open in a new tab safely, and no script is in the body`, d.external.every((a) => a.t === '_blank' && a.r === 'noopener noreferrer') && d.scripts === 0)
    ok(`${T}: text is 18px serif, and the page does not scroll sideways`, d.fontSize === '18px' && /serif/i.test(d.family) && d.hs)
    ok(`${T}: no console errors`, errors.length === 0, errors.join(' | '))
    await close()
  }

  // ---- Going back and forth
  {
    const { page, close } = await openPage(ctx.browser, base)
    await page.evaluate(() => window.scrollTo({ top: document.getElementById('blog').getBoundingClientRect().top + scrollY - 40, behavior: 'instant' }))
    await sleep(300)
    const before = await page.evaluate(() => scrollY)
    await page.click('#blog h3 a')
    await page.waitForSelector('.post__body')
    await sleep(300)
    ok('clicking a title opens that post at its own address', (await page.evaluate(() => location.hash)) === `#/blog/${shown[0].slug}`)
    await page.click('.post__back')
    await sleep(600)
    const back = await page.evaluate(() => ({ hash: location.hash, blogTop: document.getElementById('blog')?.getBoundingClientRect().top, header: document.querySelector('.site-header').getBoundingClientRect().height, title: document.title }))
    ok('the Back link returns to the Blog section on the home page and restores the page title', back.hash === '#blog' && back.blogTop !== undefined && back.title === content.site.pageTitle, JSON.stringify(back))
    await page.evaluate(() => { history.replaceState(null, '', location.pathname); window.scrollTo({ top: 0, behavior: 'instant' }) })
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), before)
    await sleep(200)
    await page.click('#blog h3 a')
    await page.waitForSelector('.post__body')
    await page.goBack()
    await sleep(700)
    const after = await page.evaluate(() => scrollY)
    ok('the browser Back button returns to the home page at the same place', Math.abs(after - before) <= 40, `before ${before}, after ${after}`)
    await close()
  }
  {
    const { page, close } = await openPage(ctx.browser, `${base}#/blog/${shown[0].slug}`, { wait: '.post__body' })
    await page.reload({ waitUntil: 'networkidle0' })
    await page.waitForSelector('.post__body')
    ok('reloading on a post address keeps that post', await page.evaluate(() => document.querySelector('h1')?.textContent) === shown[0].title)
    await page.keyboard.press('Tab')
    await page.evaluate(() => document.querySelector('.skip-link').focus())
    await page.keyboard.press('Enter')
    ok('the skip link works on a post page without changing the address', await page.evaluate(() => document.activeElement.id === 'main' && location.hash.startsWith('#/blog/')))
    await page.click('.site-nav__list a[href="#research"]')
    await sleep(900)
    ok('a menu link from a post returns home, jumps to the section, and highlights it', await page.evaluate(() => location.hash === '#research' && !!document.getElementById('research') && document.querySelector('.site-nav__list a[aria-current="true"]')?.getAttribute('href') === '#research'))
    await close()
  }
}
