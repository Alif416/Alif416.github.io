// Layout on many screens and settings: nine screen sizes in both themes, the larger text
// sizes people set in their browser, and the WCAG text-spacing override.

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { launch, openPage, sleep } from '../lib/browser.mjs'

const audit = (page) =>
  page.evaluate(() => {
    const vw = innerWidth
    const skip = (el) => el.closest('pre,.table-wrap,.visually-hidden,.skip-link,#page-end,noscript,svg')
    const overflow = [...document.querySelectorAll('body *')].filter((el) => !skip(el) && el.getClientRects().length).filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 1 || r.left < -1) }).slice(0, 3).map((el) => el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0])
    const clipped = [...document.querySelectorAll('.button,.chip,.icon-link,.blog-post__tags li,.project-card__tech li,.site-nav__list a,.site-header__brand,.cv-block p,.thesis__label,.contact__label,.hero h1')].filter((el) => el.getClientRects().length && el.scrollWidth > el.clientWidth + 1).slice(0, 3).map((el) => String(el.className).split(' ')[0])
    const targets = [...document.querySelectorAll('a[href], button')].filter((e) => e.getClientRects().length && !e.closest('.skip-link,.visually-hidden,.post__body,.site-footer')).map((e) => ({ e, r: e.getBoundingClientRect() })).filter((x) => x.r.width > 0)
    const small = targets.filter((x) => Math.min(x.r.width, x.r.height) < 24 && !x.e.closest('p,li:not(.blog-post__title)') ).slice(0, 3).map((x) => (x.e.textContent || x.e.getAttribute('aria-label') || '').trim().slice(0, 16))
    const overlaps = []
    for (let i = 0; i < targets.length; i++) for (let j = i + 1; j < targets.length; j++) {
      const a = targets[i], b = targets[j]
      if (a.e.contains(b.e) || b.e.contains(a.e)) continue
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top)
      if (w > 2 && h > 2) overlaps.push((a.e.textContent || '').trim().slice(0, 10) + ' x ' + (b.e.textContent || '').trim().slice(0, 10))
    }
    const menu = document.querySelector('.menu-button')
    const menuShown = getComputedStyle(menu).display !== 'none'
    return { hs: document.documentElement.scrollWidth > vw, overflow, clipped, small, overlaps: overlaps.slice(0, 3), header: Math.round(document.querySelector('.site-header').getBoundingClientRect().height), menuReachable: !menuShown || (menu.getBoundingClientRect().right <= vw + 1 && menu.getBoundingClientRect().left >= -1) }
  })

const problems = (a, { headerMax } = {}) => [a.hs && 'horizontal scroll', a.overflow.length && 'overflow: ' + a.overflow, a.clipped.length && 'clipped: ' + a.clipped, a.small.length && 'target under 24px: ' + a.small, a.overlaps.length && 'overlap: ' + a.overlaps, headerMax && a.header > headerMax && `header ${a.header}px`, !a.menuReachable && 'menu button off screen'].filter(Boolean)

export default async function (ctx, { ok }) {
  const { expected, base } = ctx
  const SIZES = ctx.quick ? [[320, 640], [768, 1024], [1280, 800]] : [[320, 640], [375, 667], [414, 896], [568, 320], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]]
  const pages = [['home', base], ['"Post not found"', base + '#/blog/this-post-does-not-exist']]
  if (expected.hasBlog) pages.push([`post "${expected.visible[0].slug}"`, `${base}#/blog/${expected.visible[0].slug}`])

  // ---- Screen sizes x pages x themes
  for (const [name, url] of pages) {
    const bad = []
    let count = 0
    for (const scheme of ['light', 'dark']) for (const [w, h] of SIZES) {
      const { page, errors, close } = await openPage(ctx.browser, url, { width: w, height: h, scheme, wait: name.startsWith('post "') ? '.post__body' : undefined })
      await sleep(150)
      const p = [...problems(await audit(page), { headerMax: 57 }), errors.length && 'console: ' + errors[0]].filter(Boolean)
      if (p.length) bad.push(`${w}x${h} ${scheme}: ${p.join('; ')}`)
      count++
      await close()
    }
    ok(`${name}: no overflow, clipping, overlap, tiny target, tall header, or console error at ${SIZES.length} sizes in light and dark (${count} combinations)`, bad.length === 0, bad.slice(0, 3).join(' || '))
  }

  // ---- Text-spacing override (WCAG 1.4.12)
  for (const [w, h] of [[1280, 800], [768, 1024], [375, 667], [320, 640]]) {
    const { page, close } = await openPage(ctx.browser, base, { width: w, height: h })
    await page.addStyleTag({ content: '*{line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}p{margin-bottom:2em !important}' })
    await sleep(200)
    const p = problems(await audit(page))
    ok(`with letters and words spaced wider (WCAG text spacing), ${w}px wide shows nothing cut off, overlapping, or off screen`, p.length === 0, p.join('; '))
    await close()
  }

  // ---- Larger default text sizes, set the way a person sets them in the browser
  if (ctx.quick) return
  for (const px of [16, 24, 32, 40]) {
    const dir = join(ctx.root, '.checks-tmp', `chrome-prefs-${px}`)
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(join(dir, 'Default'), { recursive: true })
    writeFileSync(join(dir, 'Default/Preferences'), JSON.stringify({ webkit: { webprefs: { default_font_size: px, default_fixed_font_size: Math.round(px * 0.8125), minimum_font_size: 0, minimum_logical_font_size: 0 } } }))
    const browser = await launch({ userDataDir: dir })
    const bad = []
    let rootOk = true
    for (const [w, h] of [[1280, 800], [1024, 768], [768, 1024], [375, 667], [320, 640]]) {
      const page = await browser.newPage()
      await page.setViewport({ width: w, height: h })
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
      await page.goto(base, { waitUntil: 'networkidle0' })
      rootOk &&= (await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))) === px
      const p = problems(await audit(page))
      if (p.length) bad.push(`${w}px: ${p.join('; ')}`)
      await page.close()
    }
    await browser.close()
    rmSync(dir, { recursive: true, force: true })
    ok(`with the browser's default text size at ${Math.round((px / 16) * 100)}%, five screen widths show nothing cut off, overlapping, or off screen`, rootOk && bad.length === 0, rootOk ? bad.join(' || ') : 'the text size setting did not apply')
  }
}
