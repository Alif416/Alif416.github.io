// The profile photo: the right file for each screen, a fallback for old browsers,
// and no layout shift while it loads.

import { openPage } from '../lib/browser.mjs'

export default async function (ctx, { ok, skip }) {
  const photo = ctx.content.person.photo
  if (!photo) {
    skip('photo checks', 'no photo is set in content.ts (a letter in a circle is shown instead)')
    return
  }
  const files = (set) => (set ?? '').split(',').map((part) => part.trim().split(/\s+/)).filter((p) => p[0])
  const wanted = [photo.src, ...files(photo.srcSet).map((f) => f[0]), ...(photo.sources ?? []).flatMap((s) => files(s.srcSet).map((f) => f[0]))]
  const statuses = await Promise.all(wanted.map(async (f) => [f, await ctx.getStatus(f)]))
  ok(`all ${wanted.length} photo files named in content.ts are served`, statuses.every(([, s]) => s === 200), statuses.filter(([, s]) => s !== 200).map(([f]) => f).join(', '))

  // What the browser downloads at different screens
  for (const [w, h, dpr] of [[1280, 800, 1], [1280, 800, 2], [375, 667, 1], [375, 667, 3]]) {
    const context = await ctx.browser.createBrowserContext()
    const page = await context.newPage()
    await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr })
    const downloaded = []
    page.on('response', (r) => /\/photo[^/]*\.(jpg|webp)$/.test(r.url()) && downloaded.push(new URL(r.url()).pathname))
    await page.goto(ctx.base, { waitUntil: 'networkidle0' })
    const d = await page.evaluate(() => { const i = document.querySelector('.photo'); return { cur: i.currentSrc.replace(location.origin, ''), loaded: i.complete && i.naturalWidth > 0, css: Math.round(i.getBoundingClientRect().width) } })
    const sizes = (photo.sources?.[0]?.srcSet ? files(photo.sources[0].srcSet) : files(photo.srcSet)).map((f) => [f[0], parseInt(f[1])])
    const need = d.css * dpr
    const best = sizes.filter(([, px]) => px >= need).sort((a, b) => a[1] - b[1])[0]?.[0] ?? sizes.sort((a, b) => b[1] - a[1])[0]?.[0]
    ok(`${w}px wide at ${dpr}x: only one photo file is downloaded, the smallest that is sharp enough (${best ?? photo.src})`, downloaded.length === 1 && d.loaded && (!best || d.cur === best), `${downloaded.join()} for a ${d.css}px photo`)
    await context.close()
  }

  const { page, close } = await openPage(ctx.browser, ctx.base)
  const m = await page.evaluate(() => { const i = document.querySelector('.photo'); return { picture: i.parentElement.tagName === 'PICTURE', source: [...document.querySelectorAll('picture source')].map((s) => s.type), w: i.getAttribute('width'), h: i.getAttribute('height'), lazy: i.getAttribute('loading'), fp: i.getAttribute('fetchpriority'), alt: i.alt, round: getComputedStyle(i).borderRadius, fit: getComputedStyle(i).objectFit } })
  ok('modern formats come first, with the main file as the fallback in the same picture', photo.sources?.length ? m.picture && JSON.stringify(m.source) === JSON.stringify(photo.sources.map((s) => s.type)) : !m.picture)
  ok('the photo has a width and height (no layout shift), loads at once, and is not lazy', m.w && m.h && m.lazy !== 'lazy' && m.fp === 'high')
  ok('the alt text is the one in content.ts, and the photo is round and cropped to fill', m.alt === photo.alt && m.round === '50%' && m.fit === 'cover')
  await close()
}
