// Accessibility: automated axe-core checks on every kind of page, a full keyboard walk,
// names and landmarks, forced-colours mode, and the contrast of hover and focus states.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { contrast, openPage, sleep } from '../lib/browser.mjs'

export default async function (ctx, { ok, skip }) {
  const { content: c, expected, base } = ctx
  const axeSource = readFileSync(join(ctx.root, 'node_modules/axe-core/axe.min.js'), 'utf8')
  const RULES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']

  const runAxe = async (page) => {
    await page.evaluate(axeSource)
    return page.evaluate(async (tags) => {
      const r = await axe.run(document, { runOnly: { type: 'tag', values: tags } })
      return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join('; ')}`)
    }, RULES)
  }

  // ---- axe on each kind of page
  const states = [
    ['home, light, desktop', base, { scheme: 'light' }],
    ['home, dark, desktop', base, { scheme: 'dark' }],
    ['home, light, phone', base, { scheme: 'light', width: 375, height: 667 }],
    ['home, dark, phone', base, { scheme: 'dark', width: 375, height: 667 }],
    ['"Post not found" page', base + '#/blog/this-post-does-not-exist', {}],
  ]
  for (const [name, url, opts] of states) {
    const { page, close } = await openPage(ctx.browser, url, opts)
    const v = await runAxe(page)
    ok(`axe finds no violations on the ${name}`, v.length === 0, v.join(' | '))
    await close()
  }
  for (const [w, h] of [[375, 667], [568, 320]]) {
    const { page, close } = await openPage(ctx.browser, base, { width: w, height: h })
    await page.click('.menu-button')
    await sleep(250)
    const v = await runAxe(page)
    ok(`axe finds no violations with the mobile menu open at ${w}x${h}`, v.length === 0, v.join(' | '))
    await close()
  }
  if (expected.hasBlog) {
    for (const scheme of ['light', 'dark']) {
      const { page, close } = await openPage(ctx.browser, `${base}#/blog/${expected.visible[0].slug}`, { scheme, wait: '.post__body' })
      const v = await runAxe(page)
      ok(`axe finds no violations on a blog post page (${scheme})`, v.length === 0, v.join(' | '))
      await close()
    }
  } else skip('axe on a blog post page', 'no post is shown on this build')
  // No-JavaScript fallback: load with scripting off so the real <noscript> markup and real CSS are used,
  // then turn scripting on only to run axe. axe ignores <noscript> by design, so swap it for a plain <div>.
  for (const scheme of ['light', 'dark']) {
    const context = await ctx.browser.createBrowserContext()
    const page = await context.newPage()
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }])
    const cdp = await page.createCDPSession()
    await cdp.send('Emulation.setScriptExecutionDisabled', { value: true })
    await page.goto(base, { waitUntil: 'networkidle0' })
    await cdp.send('Emulation.setScriptExecutionDisabled', { value: false })
    await page.evaluate(() => { const n = document.querySelector('noscript'); const d = document.createElement('div'); while (n.firstChild) d.appendChild(n.firstChild); n.replaceWith(d) })
    const appNotRunning = await page.evaluate(() => document.getElementById('root').children.length === 0)
    const v = await runAxe(page)
    ok(`axe finds no violations in the no-JavaScript fallback (${scheme}, the app is not running)`, appNotRunning && v.length === 0, v.join(' | '))
    await context.close()
  }

  // ---- Keyboard walk through the whole home page
  for (const scheme of ['light', 'dark']) {
    const { page, close } = await openPage(ctx.browser, base, { scheme })
    const stops = []
    for (let i = 0; i < 120; i++) {
      await page.keyboard.press('Tab')
      const s = await page.evaluate(() => {
        const e = document.activeElement
        if (!e || e === document.body) return null
        const r = e.getBoundingClientRect(), cs = getComputedStyle(e)
        return { name: (e.getAttribute('aria-label') || e.textContent || '').replace(/\s*\(opens in a new tab\)/, '').trim().slice(0, 22), docY: Math.round(r.top + scrollY), inView: r.bottom > 0 && r.top < innerHeight, ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || cs.boxShadow !== 'none', sticky: !!e.closest('.site-header') }
      })
      if (!s) break
      stops.push(s)
    }
    const T = `keyboard walk (${scheme})`
    ok(`${T}: focus passes through the page and then leaves it (${stops.length} stops, no trap)`, stops.length >= 10 && stops.length < 120)
    ok(`${T}: every stop shows a visible focus indicator`, stops.every((s) => s.ring), stops.filter((s) => !s.ring).map((s) => s.name).join(', '))
    ok(`${T}: every stop is on screen when focused`, stops.every((s) => s.inView))
    const body = stops.filter((s) => !s.sticky)
    ok(`${T}: the order follows the page from top to bottom`, body.every((s, i) => i === 0 || s.docY >= body[i - 1].docY - 2))
    ok(`${T}: it starts with the skip link, then the site name and the section links`, stops[0].name === 'Skip to main content' && stops[1].name === c.person.name && stops.slice(2, 2 + expected.navItems.length).map((s) => s.name).join() === expected.navItems.map((n) => n.label).join())
    await close()
  }

  // ---- Names, landmarks, headings
  {
    const { page, close } = await openPage(ctx.browser, base)
    const d = await page.evaluate(() => {
      const unnamed = [...document.querySelectorAll('a[href], button')].filter((e) => !(e.getAttribute('aria-label') || e.textContent.trim() || e.querySelector('img[alt]')?.alt))
      const h = [...document.querySelectorAll('h1,h2,h3,h4')].map((x) => +x.tagName[1])
      return { unnamed: unnamed.length, banner: document.querySelectorAll('header').length, nav: document.querySelectorAll('nav').length, main: document.querySelectorAll('main').length, footer: document.querySelectorAll('footer').length, h1: h.filter((n) => n === 1).length, skips: h.some((n, i) => i > 0 && n - h[i - 1] > 1), external: [...document.querySelectorAll('a[target="_blank"]')].every((a) => /opens in a new tab/.test(a.textContent)), iconsHidden: [...document.querySelectorAll('.icon-link svg')].every((s) => s.getAttribute('aria-hidden') === 'true') }
    })
    ok('every link and button has a name (icon links, the theme toggle, and the menu button included)', d.unnamed === 0)
    ok('there is one banner, one navigation, one main, and one footer landmark', d.banner === 1 && d.nav === 1 && d.main === 1 && d.footer === 1)
    ok('there is one h1, and heading levels never skip', d.h1 === 1 && !d.skips)
    ok('every link that opens a new tab says so for screen readers, and icons are hidden from them', d.external && d.iconsHidden)
    await close()
  }

  // ---- Forced colours (Windows high contrast)
  for (const scheme of ['light', 'dark']) {
    const context = await ctx.browser.createBrowserContext()
    const page = await context.newPage()
    await page.setViewport({ width: 1280, height: 900 })
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }, { name: 'forced-colors', value: 'active' }])
    await page.goto(base, { waitUntil: 'networkidle0' })
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    const d = await page.evaluate(() => {
      const cs = (e) => getComputedStyle(e), q = (s) => document.querySelector(s)
      return { forced: matchMedia('(forced-colors: active)').matches, ring: cs(document.activeElement).outlineStyle + ' ' + cs(document.activeElement).outlineWidth, borders: ['.hero .button--primary', '.hero .icon-link', '.theme-toggle'].map((s) => cs(q(s)).borderTopStyle + ' ' + cs(q(s)).borderTopWidth) }
    })
    ok(`forced-colours mode (${scheme}): focus rings and the borders of buttons, icon links, and the toggle stay visible`, d.forced && /solid [2-9]/.test(d.ring) && d.borders.every((b) => /solid 1px/.test(b)), JSON.stringify(d))
    await context.close()
  }

  // ---- Contrast of hover, current, and focus states
  for (const scheme of ['light', 'dark']) {
    const { page, close } = await openPage(ctx.browser, base, { scheme })
    const probes = [['menu link hover', '.site-nav__list a:nth-child(1)'], ['current menu link', '.site-nav__list a[aria-current="true"]'], ['primary button hover', '.hero .button--primary'], ['site name hover', '.site-header__brand'], ['theme toggle hover', '.theme-toggle']]
    const low = []
    for (const [name, sel] of probes) {
      const el = (await page.$(sel)) ?? (await page.$('.site-nav__list a'))
      await el.hover()
      await sleep(250)
      const ratio = await page.evaluate((e) => {
        const num = (col) => { const m = col.match(/[\d.]+/g).map(Number); return col.startsWith('color(srgb') ? [m[0] * 255, m[1] * 255, m[2] * 255, m[3] ?? 1] : [m[0], m[1], m[2], m[3] ?? 1] }
        let n = e, bg = [255, 255, 255]
        while (n) { const m = num(getComputedStyle(n).backgroundColor); if (m[3] > 0) { bg = m.slice(0, 3); break } n = n.parentElement }
        return { fg: num(getComputedStyle(e).color).slice(0, 3), bg }
      }, el)
      const r = contrast(ratio.fg, ratio.bg)
      if (r < 4.5) low.push(`${name} ${r.toFixed(2)}`)
    }
    ok(`text colours of hover and current states meet 4.5:1 (${scheme})`, low.length === 0, low.join(', '))
    const vars = await page.evaluate(() => { const s = getComputedStyle(document.documentElement); return { accent: s.getPropertyValue('--accent').trim(), bg: s.getPropertyValue('--bg').trim() } })
    const hex = (h) => { const x = h.length === 4 ? '#' + [...h.slice(1)].map((k) => k + k).join('') : h; return [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)) }
    ok(`the focus ring colour against the page background is at least 3:1 (${scheme})`, contrast(hex(vars.accent), hex(vars.bg)) >= 3, contrast(hex(vars.accent), hex(vars.bg)).toFixed(2))
    await close()
  }
}
