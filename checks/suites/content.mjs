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

  // ---- Thesis (inside the Research section; there is no publications list)
  const t = c.thesis
  ok('the thesis title and "Supervised by ..., year" line come from the data', (await text('.thesis h3')) === t.title && (await text('.thesis__meta')) === `Supervised by ${t.supervisor}, ${t.year}`)
  const abstract = await text('.thesis__abstract')
  ok(t.abstract ? 'the thesis abstract is shown' : 'there is no abstract in the data, so no abstract is shown', t.abstract ? abstract === t.abstract : abstract === null)
  const thesisLinks = await links('.thesis__links a')
  const thesisWant = [t.pdfUrl && ['PDF', t.pdfUrl], t.codeUrl && ['Code', t.codeUrl]].filter(Boolean)
  ok('the thesis PDF and code links are shown only if set, open in a new tab, and are 44px tall', JSON.stringify(thesisLinks.map((l) => [l.label, l.href])) === JSON.stringify(thesisWant) && newTab(thesisLinks) && thesisLinks.every((l) => l.h >= 44), `${thesisLinks.length} links`)
  const ms = await page.evaluate(() => [...document.querySelectorAll('.milestones li')].map((li) => li.textContent))
  ok('the thesis milestones are shown in the order of the data, and hidden when there are none', JSON.stringify(ms) === JSON.stringify(t.milestones.map((m) => (m.date ?? '') + m.label)), ms.join(' | '))
  const lay = await page.evaluate(() => { const r = (s) => { const b = document.querySelector(s)?.getBoundingClientRect(); return b && { left: b.left, right: b.right } }; return { thesis: r('#research .thesis'), box: r('.research-box'), inner: innerWidth } })
  ok('on a wide screen the thesis is on the left and the interests box is on the right', lay.inner < 768 || (lay.thesis.right <= lay.box.left + 1), JSON.stringify(lay))
  ok('the thesis sits inside the Research section, and there is no separate Thesis or Publications section', await page.evaluate(() => !!document.querySelector('#research .thesis') && !document.getElementById('thesis') && !document.querySelector('.publications')))

  // ---- Projects
  const projects = await page.evaluate(() => ({ cards: [...document.querySelectorAll('#projects article')].map((a) => ({ title: a.querySelector('h3')?.textContent, summary: a.querySelector('.project-card__summary')?.textContent, tech: [...a.querySelectorAll('.project-card__tech li')].map((x) => x.textContent), links: [...a.querySelectorAll('.chip')].map((x) => [x.textContent.replace(/\s*\(opens in a new tab\)/, ''), x.getAttribute('href')]) })), message: document.querySelector('#projects p.muted')?.textContent ?? null }))
  if (c.projects.length === 0) {
    ok('no projects are in the data, so the status line is shown and there are no cards', projects.cards.length === 0 && projects.message === c.projectsEmptyMessage, projects.message)
  } else {
    ok('each project is a card, in the order of the data, with its summary and tech tags', JSON.stringify(projects.cards.map((p) => [p.title, p.summary, p.tech])) === JSON.stringify(c.projects.map((p) => [p.title, p.summary, p.tech])) && projects.message === null)
    ok('each project shows a GitHub or Demo link only if the data has one', projects.cards.every((card, i) => JSON.stringify(card.links) === JSON.stringify([c.projects[i].githubUrl && ['GitHub', c.projects[i].githubUrl], c.projects[i].demoUrl && ['Demo', c.projects[i].demoUrl]].filter(Boolean))))
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
