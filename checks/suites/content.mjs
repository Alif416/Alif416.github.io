// What each section shows, checked against src/data/content.ts. Anything the data leaves
// out (null or an empty list) must be hidden, and anything it contains must be shown.

import { openPage } from '../lib/browser.mjs'

export default async function (ctx, { ok, skip }) {
  const { content: c, base } = ctx
  const { page, errors, close } = await openPage(ctx.browser, base)
  const text = (sel) => page.evaluate((s) => document.querySelector(s)?.textContent.replace(/\s+/g, ' ').trim() ?? null, sel)
  const links = (sel) => page.evaluate((s) => [...document.querySelectorAll(s)].map((a) => ({ label: a.textContent.replace(/\s*\(opens in a new tab\)/g, '').replace(/\s+/g, ' ').trim(), href: a.getAttribute('href'), target: a.target, rel: a.rel, hidden: !!a.querySelector('.visually-hidden'), h: Math.round(a.getBoundingClientRect().height), w: Math.round(a.getBoundingClientRect().width) })), sel)
  const newTab = (l) => l.every((x) => x.target === '_blank' && x.rel.includes('noopener') && x.rel.includes('noreferrer') && x.hidden)
  const profile = [
    ['Google Scholar', c.links.scholar],
    ['GitHub', c.links.github],
    ['LinkedIn', c.links.linkedin],
    ['ORCID', c.links.orcid],
  ].filter(([, url]) => url)

  // ---- Hero
  ok('the name, headline, research statement, and bio come from the data', (await text('#about h1')) === c.person.name && (await text('.hero__headline')) === c.person.headline && (await text('.hero__statement')) === c.person.researchStatement && (await text('.hero__bio')) === c.person.bio)
  const buttons = await links('.hero__buttons a')
  ok('the CV button has the right label and link, opens in a new tab, and is 44px tall (there is no Transcript button)', JSON.stringify(buttons.map((b) => [b.label, b.href])) === JSON.stringify([[c.documents.cv.label, c.documents.cv.url]]) && newTab(buttons) && buttons.every((b) => b.h >= 44))
  const icons = await links('.profile-links a')
  const iconWant = [...(c.links.email ? [['Email']] : []), ...profile.map(([n, u]) => [n, u])]
  ok('the icon links are exactly the profiles that are set, and a missing one is hidden', JSON.stringify(icons.map((i) => i.label)) === JSON.stringify(iconWant.map((w) => w[0])), icons.map((i) => i.label).join(', '))
  ok('profile icon links go to the right addresses, open in a new tab, and are at least 44px', icons.filter((i) => i.label !== 'Email').every((i, n) => i.href === profile[n][1]) && newTab(icons.filter((i) => i.label !== 'Email')) && icons.every((i) => i.h >= 44 && i.w >= 44))
  if (c.links.email) {
    const email = icons.find((i) => i.label === 'Email')
    ok('the email icon gets its mailto: address in the browser', email?.href === `mailto:${c.links.email.user}@${c.links.email.domain}`)
  } else ok('no email is set, so no email icon is shown', !icons.some((i) => i.label === 'Email'))
  const photo = await page.evaluate(() => { const p = document.querySelector('.photo'); return p ? { tag: p.tagName, alt: p.alt, loaded: p.complete && p.naturalWidth > 0, w: Math.round(p.getBoundingClientRect().width) } : null })
  if (c.person.photo) ok('the photo is shown with the alt text from the data, and loaded', photo?.tag === 'IMG' && photo.alt === c.person.photo.alt && photo.loaded && photo.w === 192, JSON.stringify(photo))
  else ok('no photo is set, so a letter in a circle is shown', photo?.tag === 'DIV')

  // ---- Research
  const research = await page.evaluate(() => [...document.querySelectorAll('.research-list li')].map((li) => li.textContent))
  ok('the research interests are shown as a plain list, in the order and words in the data, with no descriptions', JSON.stringify(research) === JSON.stringify(c.research), `${research.length} of ${c.research.length}`)

  // ---- Thesis and papers (a timeline inside the Research section, one dot for each)
  const papers = await page.evaluate(() => [...document.querySelectorAll('.papers__item')].map((li) => ({ kind: li.querySelector('.papers__label')?.textContent ?? null, title: li.querySelector('h3')?.textContent ?? null, meta: li.querySelector('.papers__meta')?.textContent ?? null, abstract: li.querySelector('.papers__abstract')?.textContent ?? null, links: [...li.querySelectorAll('.papers__links a')].map((a) => [a.textContent.replace(/\s*\(opens in a new tab\)/, ''), a.getAttribute('href'), a.target, a.rel.includes('noopener'), Math.round(a.getBoundingClientRect().height)]) })))
  ok('each thesis or paper is one entry, in the order of the data, with its title and meta line', JSON.stringify(papers.map((p) => [p.title, p.meta])) === JSON.stringify(c.papers.map((p) => [p.title, p.meta])), `${papers.length} of ${c.papers.length}`)
  ok('the kind and date line, and the abstract, are shown only when set', papers.every((p, i) => p.kind === c.papers[i].kind + (c.papers[i].date ?? '') && p.abstract === c.papers[i].abstract))
  ok('PDF and code links are shown only if set, open in a new tab, and are 44px tall', papers.every((p, i) => JSON.stringify(p.links.map((l) => [l[0], l[1]])) === JSON.stringify([c.papers[i].pdfUrl && ['PDF', c.papers[i].pdfUrl], c.papers[i].codeUrl && ['Code', c.papers[i].codeUrl]].filter(Boolean)) && p.links.every((l) => l[2] === '_blank' && l[3] && l[4] >= 44)))
  const lay = await page.evaluate(() => { const r = (s) => { const b = document.querySelector(s)?.getBoundingClientRect(); return b && { left: b.left, right: b.right } }; return { papers: r('.papers'), box: r('.research-box'), inner: innerWidth } })
  ok('on a wide screen the papers timeline is on the left and the sticky notes box is on the right', c.papers.length === 0 || lay.inner < 768 || lay.papers.right <= lay.box.left + 1, JSON.stringify(lay))
  ok('the thesis is inside the Research section, and there is no separate Thesis or Publications section', await page.evaluate(() => (!!document.querySelector('#research .papers') || !document.querySelector('.papers')) && !document.getElementById('thesis') && !document.querySelector('.publications')))

  // ---- Projects
  const projects = await page.evaluate(() => ({ cards: [...document.querySelectorAll('#projects article')].map((a) => ({ title: a.querySelector('h3')?.textContent, summary: a.querySelector('.project-card__summary')?.textContent, tech: [...a.querySelectorAll('.project-card__tech li')].map((x) => x.textContent), links: [...a.querySelectorAll('.chip')].map((x) => [x.textContent.replace(/\s*\(opens in a new tab\)/, ''), x.getAttribute('href')]) })), message: document.querySelector('#projects p.muted')?.textContent ?? null }))
  if (c.projects.length === 0) {
    ok('no projects are in the data, so the status line is shown and there are no cards', projects.cards.length === 0 && projects.message === c.projectsEmptyMessage, projects.message)
  } else {
    ok('each project is a card, in the order of the data, with its summary and tech tags', JSON.stringify(projects.cards.map((p) => [p.title, p.summary, p.tech])) === JSON.stringify(c.projects.map((p) => [p.title, p.summary, p.tech])) && projects.message === null)
    ok('each project shows a GitHub or Demo link only if the data has one', projects.cards.every((card, i) => JSON.stringify(card.links) === JSON.stringify([c.projects[i].githubUrl && ['GitHub', c.projects[i].githubUrl], c.projects[i].demoUrl && ['Demo', c.projects[i].demoUrl]].filter(Boolean))))
    // One dot glides down the line while scrolling, and the project it reaches is highlighted.
    const dots = await page.evaluate(() => document.querySelectorAll('.timeline__dot').length)
    ok('the projects timeline has exactly one dot', dots === 1, `${dots} dots`)
    if (c.projects.length > 1) {
      const results = []
      for (let i = 0; i < c.projects.length; i++) {
        await page.evaluate((i) => {
          const li = document.querySelectorAll('.timeline__item')[i]
          const anchor = li.getBoundingClientRect().top + li.firstElementChild.getBoundingClientRect().height / 2
          window.scrollBy({ top: anchor - innerHeight * 0.45, behavior: 'instant' })
        }, i)
        await new Promise((r) => setTimeout(r, 250))
        results.push(await page.evaluate((i) => {
          const items = [...document.querySelectorAll('.timeline__item')]
          const dot = document.querySelector('.timeline__dot').getBoundingClientRect()
          const li = items[i], first = li.firstElementChild.getBoundingClientRect()
          return { active: items.map((x, n) => x.classList.contains('is-active') ? n : -1).filter((n) => n >= 0), lifted: items.map((x, n) => getComputedStyle(x.querySelector('.project-card')).transform !== 'none' ? n : -1).filter((n) => n >= 0), gap: Math.round(Math.abs(dot.top + dot.height / 2 - (first.top + first.height / 2))) }
        }, i))
      }
      ok('scrolling to each project moves the one dot beside it and highlights only that project', results.every((r, i) => r.active.length === 1 && r.active[0] === i && r.gap <= 24), JSON.stringify(results))
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    }
    // With motion allowed, only the highlighted project is lifted in 3D. With reduced motion, none are.
    {
      const lifted = (p) => p.evaluate(() => [...document.querySelectorAll('.timeline__item')].map((x, n) => getComputedStyle(x.querySelector('.project-card')).transform !== 'none' ? n : -1).filter((n) => n >= 0))
      const calm = await lifted(page)
      const moving = await openPage(ctx.browser, base, { reduced: false })
      await moving.page.evaluate(() => { const li = document.querySelectorAll('.timeline__item')[1]; window.scrollBy({ top: li.getBoundingClientRect().top + li.firstElementChild.getBoundingClientRect().height / 2 - innerHeight * 0.45, behavior: 'instant' }) })
      await new Promise((r) => setTimeout(r, 900))
      const lift = await lifted(moving.page)
      ok('only the highlighted project is lifted in 3D, and none are when reduced motion is on', c.projects.length < 2 || (calm.length === 0 && lift.length === 1 && lift[0] === 1), JSON.stringify({ calm, lift }))
      await moving.close()
    }
    const shape = await page.evaluate(() => { const g = (s) => [...document.querySelectorAll(s)].map((a) => { const r = a.getBoundingClientRect(); return { left: r.left, right: r.right, width: r.width, height: r.height } }); return { cards: g('#projects article'), main: g('.project-card__main'), side: g('.project-card__side'), inner: innerWidth } })
    ok('on a wide screen each project card is a wide landscape card, text on the left and tech and links on the right', shape.inner < 768 || shape.cards.every((r, i) => r.width > r.height * 1.5 && shape.side[i].left >= shape.main[i].right - 1), JSON.stringify(shape.cards.map((r) => [Math.round(r.width), Math.round(r.height)])))
    if (c.projects.length < 3) skip(`the target is three to five projects`, `${c.projects.length} so far`)
    else ok('no more than five projects are shown (the target for this site is three to five)', c.projects.length <= 5, `${c.projects.length} projects`)
  }

  // ---- The CV and Transcript section is gone, and so is the Transcript
  ok('there is no CV section, no transcript, and no education block on the page', await page.evaluate(() => !document.getElementById('cv') && !/transcript/i.test(document.body.innerText) && !document.querySelector('.cv-block')))

  // ---- Contact
  ok(c.contact.intro ? 'the contact sentence is shown' : 'no contact sentence is in the data, so none is shown', c.contact.intro ? (await text('.contact__intro')) === c.contact.intro : (await text('.contact__intro')) === null)
  const contactLinks = await links('.contact__links a')
  ok('the contact links are exactly the profiles that are set, with icons, and open in a new tab', JSON.stringify(contactLinks.map((l) => [l.label, l.href])) === JSON.stringify(profile) && newTab(contactLinks) && contactLinks.every((l) => l.h >= 44))
  if (c.links.email) {
    const shown = await page.evaluate(() => { const a = document.querySelector('.contact__email a'); return { text: a?.textContent, href: a?.getAttribute('href') } })
    const address = `${c.links.email.user}@${c.links.email.domain}`
    ok('the email address is shown as text and as a mailto: link, put together in the browser', shown.text === address && shown.href === 'mailto:' + address)
  } else ok('no email is set, so the contact email is hidden', (await text('.contact__email')) === null)
  const bad = await page.evaluate(() => /TODO|lorem ipsum/i.test(document.body.innerText))
  ok('no TODO text or filler text is visible anywhere on the page', !bad)
  ok('no console errors', errors.length === 0, errors.join(' | '))
  await close()
}
