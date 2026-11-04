// The frame of the page: sections and their order, the sticky navigation, the skip link,
// keyboard order, the mobile menu, and the light and dark theme.

import { openPage, sleep } from '../lib/browser.mjs'

export default async function (ctx, { ok }) {
  const { content, expected, base } = ctx
  const ids = expected.sectionIds
  const labels = expected.navItems.map((n) => n.label)

  // ---- Structure at desktop size
  {
    const { page, errors, close } = await openPage(ctx.browser, base)
    const d = await page.evaluate(() => ({
      banner: document.querySelectorAll('header').length,
      navLabel: document.querySelector('header nav')?.getAttribute('aria-label'),
      main: document.querySelectorAll('main').length,
      footer: document.querySelectorAll('footer').length,
      sections: [...document.querySelectorAll('main > section')].map((s) => s.id),
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent),
      h2: [...document.querySelectorAll('h2')].map((h) => h.textContent),
      labelled: [...document.querySelectorAll('main > section')].every((s) => document.getElementById(s.getAttribute('aria-labelledby'))),
      links: [...document.querySelectorAll('.site-nav__list a')].map((a) => [a.getAttribute('href'), a.textContent]),
      lang: document.documentElement.lang,
      title: document.title,
    }))
    ok('there is one header, one navigation, one main area, and one footer', d.banner === 1 && d.navLabel === 'Main' && d.main === 1 && d.footer === 1)
    ok(`the sections are in the order set in content.ts (${ids.length} shown)`, JSON.stringify(d.sections) === JSON.stringify(ids), d.sections.join(', '))
    ok('the Blog section appears only when there is a published post to show', d.sections.includes('blog') === expected.hasBlog, `${expected.visible.length} posts to show`)
    ok('the page has one h1, the name, and one h2 for each other section', d.h1.length === 1 && d.h1[0] === content.person.name && d.h2.length === ids.length - 1, `${d.h2.length} h2`)
    ok('every section is labelled by its own heading', d.labelled)
    ok('the section headings come from content.ts', JSON.stringify(d.h2) === JSON.stringify(expected.navItems.filter((n) => n.id !== 'about').map((n) => n.heading)))
    ok('the menu links match the sections, in order, with the labels from content.ts', JSON.stringify(d.links) === JSON.stringify(expected.navItems.map((n) => ['#' + n.id, n.label])), labels.join(', '))
    ok('the page language and title are set', d.lang === 'en' && d.title === content.site.pageTitle)
    ok('no console errors on load', errors.length === 0, errors.join(' | '))
    await close()
  }

  // ---- Sticky header, jumps, and the highlighted link
  {
    const { page, close } = await openPage(ctx.browser, base)
    ok('there is no header border at the very top of the page', await page.evaluate(() => !document.querySelector('.site-header').classList.contains('is-scrolled')))
    await page.evaluate(() => window.scrollTo(0, 1200))
    await sleep(300)
    const stuck = await page.evaluate(() => ({ top: Math.round(document.querySelector('.site-header').getBoundingClientRect().top), border: document.querySelector('.site-header').classList.contains('is-scrolled') }))
    ok('the header stays at the top while scrolling and gains a border', stuck.top === 0 && stuck.border)
    await page.evaluate(() => window.scrollTo(0, 0))
    await sleep(300)
    for (const id of ids.slice(1)) {
      await page.click(`.site-nav__list a[href="#${id}"]`)
      await sleep(700)
      const r = await page.evaluate((id) => {
        const h = document.getElementById(id + '-title').getBoundingClientRect()
        return { top: Math.round(h.top), bottom: Math.round(h.bottom), header: Math.round(document.querySelector('.site-header').getBoundingClientRect().height), vh: innerHeight, current: [...document.querySelectorAll('.site-nav__list a[aria-current="true"]')].map((a) => a.getAttribute('href')) }
      }, id)
      ok(`clicking "${id}" scrolls to it, below the header, and highlights that link`, r.top >= r.header && r.bottom <= r.vh && r.current.join() === '#' + id, JSON.stringify(r))
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await sleep(500)
    const top = await page.evaluate(() => document.querySelector('.site-nav__list a[aria-current="true"]')?.getAttribute('href'))
    ok('at the top of the page the first link is highlighted', top === '#' + ids[0], top)
    await page.mouse.move(600, 400)
    await page.mouse.wheel({ deltaY: 30000 })
    await sleep(800)
    const bottom = await page.evaluate(() => document.querySelector('.site-nav__list a[aria-current="true"]')?.getAttribute('href'))
    ok('at the very bottom the last link is highlighted', bottom === '#' + ids[ids.length - 1], bottom)
    await close()
  }

  // ---- Skip link and keyboard order
  {
    const { page, close } = await openPage(ctx.browser, base)
    const order = []
    for (let i = 0; i < ids.length + 3; i++) {
      await page.keyboard.press('Tab')
      order.push(await page.evaluate(() => {
        const e = document.activeElement
        return e.classList.contains('skip-link') ? 'skip' : e.classList.contains('site-header__brand') ? 'brand' : e.matches('.site-nav__list a') ? e.textContent : e.classList.contains('theme-toggle') ? 'toggle' : e.tagName
      }))
    }
    ok(`Tab goes: skip link, site name, ${labels.length} section links, theme toggle`, JSON.stringify(order.slice(0, labels.length + 3)) === JSON.stringify(['skip', 'brand', ...labels, 'toggle']), order.join(' > '))
    await page.evaluate(() => document.querySelector('.skip-link').focus())
    await page.keyboard.press('Enter')
    await sleep(200)
    ok('the skip link moves focus to the main area without changing the address', await page.evaluate(() => document.activeElement.id === 'main' && location.hash === ''))
    await close()
  }

  // ---- Mobile menu, with the keyboard, on normal and very short screens
  for (const [w, h] of [[375, 667], [568, 320], [320, 256]]) {
    const { page, close } = await openPage(ctx.browser, base, { width: w, height: h })
    const T = `${w}x${h}`
    const describe = () => page.evaluate(() => {
      const e = document.activeElement, r = e.getBoundingClientRect()
      return { text: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 16), cls: String(e.className).slice(0, 20), inView: r.top >= 0 && r.bottom <= innerHeight, open: document.querySelector('.menu-button').getAttribute('aria-expanded') }
    })
    ok(`${T}: the menu button is shown and the links are hidden until it is opened`, await page.evaluate(() => getComputedStyle(document.querySelector('.menu-button')).display !== 'none' && document.querySelector('.menu-button').getAttribute('aria-expanded') === 'false' && !document.querySelector('.site-nav__list').getClientRects().length))
    await page.focus('.menu-button')
    await page.keyboard.press('Enter')
    await sleep(200)
    let a = await describe()
    ok(`${T}: Enter opens the menu and moves focus to the first link`, a.text === labels[0] && a.open === 'true', JSON.stringify(a))
    const seen = [a.text]
    for (let i = 0; i < labels.length - 1; i++) {
      await page.keyboard.press('Tab')
      await sleep(60)
      a = await describe()
      seen.push(a.text)
    }
    ok(`${T}: Tab walks every menu link in order`, seen.join() === labels.join(), seen.join())
    ok(`${T}: the last link is scrolled into view inside the menu, and the menu never runs off the screen`, a.inView && (await page.evaluate(() => document.querySelector('.site-nav__list').getBoundingClientRect().bottom <= innerHeight)))
    await page.keyboard.press('Tab')
    a = await describe()
    ok(`${T}: the next Tab reaches the theme toggle and the menu stays open`, a.cls === 'theme-toggle' && a.open === 'true')
    await page.keyboard.press('Escape')
    await sleep(150)
    a = await describe()
    ok(`${T}: Escape closes the menu and returns focus to the menu button`, a.cls === 'menu-button' && a.open === 'false')
    if (ids.includes('projects')) {
      await page.keyboard.press('Enter')
      await sleep(150)
      const target = labels.indexOf(expected.navItems.find((n) => n.id === 'projects').label)
      for (let i = 0; i < target; i++) await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await sleep(900)
      const nav = await page.evaluate(() => ({ hash: location.hash, open: document.querySelector('.menu-button').getAttribute('aria-expanded'), top: Math.round(document.getElementById('projects-title').getBoundingClientRect().top), header: Math.round(document.querySelector('.site-header').getBoundingClientRect().height) }))
      ok(`${T}: choosing a link with the keyboard jumps there and closes the menu`, nav.hash === '#projects' && nav.open === 'false' && nav.top >= nav.header, JSON.stringify(nav))
    }
    await close()
  }

  // ---- Theme: follows the system, remembers a choice, no flash, works without storage
  for (const scheme of ['light', 'dark']) {
    const { page, close } = await openPage(ctx.browser, base, { scheme })
    ok(`with the system set to ${scheme}, the page starts in ${scheme}`, (await page.evaluate(() => document.documentElement.dataset.theme)) === scheme)
    await close()
  }
  {
    const { page, close } = await openPage(ctx.browser, base, { scheme: 'light' })
    await page.click('.theme-toggle')
    const saved = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, stored: localStorage.getItem('theme'), label: document.querySelector('.theme-toggle').getAttribute('aria-label') }))
    ok('the toggle switches the theme, saves it, and its label names the next action', saved.theme === 'dark' && saved.stored === 'dark' && /light/i.test(saved.label), JSON.stringify(saved))
    await page.evaluateOnNewDocument(() => {
      document.addEventListener('DOMContentLoaded', () => {
        window.__first = document.documentElement.dataset.theme
      })
    })
    await page.reload({ waitUntil: 'networkidle0' })
    ok('a saved choice wins over the system after a reload, with no flash (already set at first paint)', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark' && (await page.evaluate(() => window.__first)) === 'dark')
    await close()
  }
  {
    const context = await ctx.browser.createBrowserContext()
    const page = await context.newPage()
    await page.evaluateOnNewDocument(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } }))
    await page.goto(base, { waitUntil: 'networkidle0' })
    await page.click('.theme-toggle')
    ok('with browser storage blocked the page still renders and the toggle still works', await page.evaluate(() => document.querySelector('h1')?.textContent) === content.person.name && (await page.evaluate(() => ['light', 'dark'].includes(document.documentElement.dataset.theme))))
    await context.close()
  }

  // ---- Widths
  for (const w of [320, 375, 768, 1280, 1920]) {
    const { page, close } = await openPage(ctx.browser, base, { width: w })
    ok(`${w}px wide: no horizontal scroll`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await close()
  }
}
