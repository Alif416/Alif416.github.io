// What the build produces: the page head, search and sharing tags, structured data,
// robots.txt, sitemap.xml, the RSS feed, the icons and images, and that drafts and the
// email address never appear in the files served to visitors.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { plain } from '../lib/content.mjs'

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

export default async function (ctx, { ok }) {
  const { content, expected } = ctx
  const site = content.site
  const siteUrl = site.url.endsWith('/') ? site.url : site.url + '/'
  const page = await ctx.browser.newPage()
  await page.goto('about:blank')
  const inBrowser = (fn, arg) => page.evaluate(fn, arg)

  // ---- Files exist and respond
  const html = await ctx.getText('')
  const must = ['feed.xml', 'robots.txt', 'sitemap.xml', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'social-card.png']
  const statuses = await Promise.all(must.map(async (f) => [f, await ctx.getStatus(f)]))
  ok('feed.xml, robots.txt, sitemap.xml, the three icons, and the social card are all served', statuses.every(([, s]) => s === 200), statuses.filter(([, s]) => s !== 200).map(([f, s]) => `${f} ${s}`).join(', '))
  const card = await ctx.getBuffer('social-card.png')
  ok('the social card is a 1200 x 630 PNG under 150 KB', card.readUInt32BE(16) === 1200 && card.readUInt32BE(20) === 630 && card.length < 150 * 1024, `${card.readUInt32BE(16)}x${card.readUInt32BE(20)}, ${(card.length / 1024).toFixed(0)} KB`)

  // ---- Page head, read the way a crawler reads it (no JavaScript)
  const head = await inBrowser((text) => {
    const doc = new DOMParser().parseFromString(text, 'text/html')
    const meta = [...doc.querySelectorAll('meta')].map((m) => ({ key: m.getAttribute('name') ?? m.getAttribute('property'), content: m.getAttribute('content'), media: m.getAttribute('media') }))
    return {
      title: [...doc.querySelectorAll('title')].map((t) => t.textContent),
      meta,
      links: [...doc.querySelectorAll('link')].map((l) => ({ rel: l.getAttribute('rel'), href: l.getAttribute('href'), type: l.getAttribute('type'), sizes: l.getAttribute('sizes') })),
      ld: [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      lang: doc.documentElement.lang,
      noscript: text.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? '',
      scripts: [...doc.querySelectorAll('script[src]')].map((s) => s.getAttribute('src')),
    }
  }, html).catch(() => null)
  const one = (key) => head.meta.filter((m) => m.key === key)
  const val = (key) => (one(key).length === 1 ? one(key)[0].content : undefined)

  ok('there is exactly one title, and it is site.pageTitle', head.title.length === 1 && head.title[0] === site.pageTitle, head.title.join(' | '))
  ok('there is exactly one description, and it is site.description', one('description').length === 1 && val('description') === site.description)
  ok('the canonical link is site.url (with a trailing slash)', head.links.filter((l) => l.rel === 'canonical').map((l) => l.href).join() === siteUrl, head.links.filter((l) => l.rel === 'canonical').map((l) => l.href).join())
  const og = { 'og:type': 'website', 'og:site_name': site.title, 'og:title': site.pageTitle, 'og:description': site.description, 'og:url': siteUrl, 'og:image': siteUrl + 'social-card.png', 'og:image:width': '1200', 'og:image:height': '630' }
  const ogBad = Object.entries(og).filter(([k, v]) => val(k) !== v).map(([k]) => k)
  ok('the Open Graph tags (link preview) are present and match the data', ogBad.length === 0, ogBad.join(', '))
  ok('the preview image has alt text in the Open Graph and Twitter tags', Boolean(val('og:image:alt')) && Boolean(val('twitter:image:alt')))
  const tw = { 'twitter:card': 'summary_large_image', 'twitter:title': site.pageTitle, 'twitter:description': site.description, 'twitter:image': siteUrl + 'social-card.png' }
  ok('the Twitter card tags are present and match the data', Object.entries(tw).every(([k, v]) => val(k) === v))
  ok('there are theme colours for light and dark', one('theme-color').length === 2 && one('theme-color').every((m) => /prefers-color-scheme/.test(m.media ?? '')))
  ok('the icon links are present (ico, svg, apple touch)', ['/favicon.ico', '/favicon.svg', '/apple-touch-icon.png'].every((h) => head.links.some((l) => l.href === h)))
  ok('the RSS feed is announced in the head', head.links.some((l) => l.rel === 'alternate' && l.type === 'application/rss+xml' && l.href === '/feed.xml'))
  ok('nothing tells search engines to stay away (no noindex or nofollow)', !/noindex|nofollow/i.test(html))
  ok('the page language is set', Boolean(head.lang))

  // ---- Structured data holds only public facts that are already on the page
  const ld = head.ld.length === 1 ? JSON.parse(head.ld[0]) : null
  const profiles = [content.links.github, content.links.linkedin, content.links.scholar, content.links.orcid].filter(Boolean)
  ok('structured data is one valid Person with the name, address, university, and profile links from the data', ld && ld['@type'] === 'Person' && ld.name === content.person.name && ld.url === siteUrl && ld.alumniOf?.name === content.education.university && JSON.stringify(ld.sameAs ?? []) === JSON.stringify(profiles), JSON.stringify(ld)?.slice(0, 120))
  ok('structured data holds nothing else (no email, phone, address, or job title)', ld && Object.keys(ld).every((k) => ['@context', '@type', 'name', 'url', 'alumniOf', 'sameAs'].includes(k)))

  // ---- No-JavaScript fallback
  const plainNoscript = plain(head.noscript.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'"))
  ok('the no-JavaScript fallback has the name, headline, and bio', [content.person.name, content.person.headline, content.person.bio].every((t) => plainNoscript.includes(plain(t))))
  const nsLinks = [...head.noscript.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'))
  const wantLinks = [content.documents.cv.url, content.documents.transcript.url, ...profiles]
  ok('the no-JavaScript fallback links to the CV, the transcript, and each profile', JSON.stringify(nsLinks) === JSON.stringify(wantLinks), `${nsLinks.length} links`)
  ok('the no-JavaScript fallback is a main landmark', /<main[\s>]/.test(head.noscript))

  // ---- The email address is not in anything a scraper downloads
  if (content.links.email) {
    const address = `${content.links.email.user}@${content.links.email.domain}`
    const bundleUrl = head.scripts.find((s) => /\.js$/.test(s))
    const bundle = bundleUrl ? await ctx.getText(bundleUrl) : ''
    ok('the email address is not in the page source and not whole in the JavaScript', !html.includes(address) && !/mailto:/.test(html) && !bundle.includes(address), address.replace(/^[^@]+/, '...'))
  }

  // ---- robots.txt and sitemap.xml
  const robots = await ctx.getText('robots.txt')
  ok('robots.txt allows everything and names the sitemap', /User-agent: \*\s+Allow: \//.test(robots) && robots.includes(`Sitemap: ${siteUrl}sitemap.xml`))
  const sitemap = await inBrowser((text) => {
    const doc = new DOMParser().parseFromString(text, 'application/xml')
    return { error: !!doc.querySelector('parsererror'), locs: [...doc.querySelectorAll('url > loc')].map((l) => l.textContent), lastmod: doc.querySelectorAll('lastmod').length }
  }, await ctx.getText('sitemap.xml'))
  ok('sitemap.xml is valid and lists the home page only, with no invented date', !sitemap.error && sitemap.locs.join() === siteUrl && sitemap.lastmod === 0, sitemap.locs.join())

  // ---- RSS feed
  const feed = await inBrowser((text) => {
    const doc = new DOMParser().parseFromString(text, 'application/xml')
    const g = (el, tag) => el.querySelector(tag)?.textContent
    return {
      error: !!doc.querySelector('parsererror'),
      version: doc.documentElement.getAttribute('version'),
      title: g(doc, 'channel > title'), link: g(doc, 'channel > link'), description: g(doc, 'channel > description'), language: g(doc, 'channel > language'),
      self: doc.getElementsByTagName('atom:link')[0]?.getAttribute('href'),
      items: [...doc.querySelectorAll('item')].map((i) => ({ title: g(i, 'title'), link: g(i, 'link'), guid: g(i, 'guid'), pub: g(i, 'pubDate'), desc: g(i, 'description'), cats: [...i.querySelectorAll('category')].map((c) => c.textContent) })),
      hasFullContent: /content:encoded|<pre/.test(text),
    }
  }, await ctx.getText('feed.xml'))
  ok('feed.xml is valid RSS 2.0 and describes the site', !feed.error && feed.version === '2.0' && feed.title === site.title && feed.link === siteUrl && feed.description === site.description && feed.language === 'en' && feed.self === siteUrl + 'feed.xml', JSON.stringify([feed.title, feed.link, feed.self]))
  ok('the feed has one item for each published post, newest first', feed.items.map((i) => i.title).join('|') === expected.published.map((p) => p.title).join('|'), `${feed.items.length} items for ${expected.published.length} published posts`)
  ok('each feed item has the right link, date, summary, and tags', feed.items.every((item, n) => {
    const post = expected.published[n]
    return post && item.link === `${siteUrl}#/blog/${post.slug}` && item.guid === item.link && item.desc === post.summary && JSON.stringify(item.cats) === JSON.stringify(post.tags) && new Date(item.pub).toISOString().slice(0, 10) === post.date
  }))
  ok('the feed carries summaries only, never full post text', !feed.hasFullContent)

  // ---- Drafts leave no trace in the served files (needs the files on disk)
  const drafts = ctx.posts.filter((p) => p.draft)
  if (ctx.live || !ctx.distDir) {
    ok('draft posts are not served', (await Promise.all(drafts.map((d) => ctx.getStatus(`assets/${d.slug}.js`)))).every((s) => s === 404))
  } else {
    const files = walk(ctx.distDir)
    const textFiles = files.filter((f) => /\.(html|js|css|xml|txt|json|svg)$/.test(f))
    const leaks = []
    for (const draft of drafts) {
      for (const f of files) if (f.includes(draft.slug)) leaks.push(`${draft.slug} in a file name`)
      for (const f of textFiles) {
        const body = readFileSync(f, 'utf8')
        for (const needle of [draft.title, draft.summary, draft.slug]) if (body.includes(needle)) leaks.push(`"${needle.slice(0, 30)}" in ${f.replace(ctx.distDir, '')}`)
      }
    }
    ok(`none of the ${drafts.length} draft posts appear in any built file (title, summary, slug, or file name)`, leaks.length === 0, leaks.slice(0, 3).join('; '))
  }

  // ---- Wording rules for the text the build writes
  const visibleHead = [site.pageTitle, site.description, content.person.headline, content.person.bio].join(' ')
  ok('no dashes (em-dash, en-dash, double hyphen) in the title, description, headline, or bio', !/[—–]|--/.test(visibleHead))
  await page.close()
}
