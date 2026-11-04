// The writing rules from CLAUDE.md, kept as rules (not as copies of today's text), applied
// to every string a visitor can read or hear.

import { openPage } from '../lib/browser.mjs'

const STIFF = ['passionate', 'leverag', 'cutting-edge', 'cutting edge', 'delve', 'seamless', 'robust', "in today's", 'ever-evolving', 'landscape', 'holistic', 'synerg', 'state-of-the-art', 'not just', 'worth noting', 'furthermore', 'moreover', 'in order to', 'utiliz', 'comprehensive', 'dive into', 'unlock', 'empower', 'journey', 'tapestry', 'pivotal', 'crucial', 'foster', 'realm', 'testament', 'game-chang', 'world-class', 'highly motivated', 'dedicated to', 'detail-oriented', 'results-driven', 'proven track record', 'aspiring', 'enthusiast', 'strive', 'spearhead', 'innovative', 'groundbreaking', 'transformative', 'at the forefront']
const sentences = (t) => t.replace(/\bMr\./g, 'Mr').replace(/\bB\.Sc\./g, 'BSc').split(/(?<=[.!?])\s+(?=[A-Z"'])/).filter(Boolean)

export default async function (ctx, { ok }) {
  const { content: c } = ctx
  const strings = new Set()
  const grab = async (url, opts) => {
    const { page, close } = await openPage(ctx.browser, url, opts)
    const found = await page.evaluate(() => {
      const out = []
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const el = n.parentElement
        if (el.closest('script,style,noscript')) continue
        const t = n.textContent.replace(/\s+/g, ' ').trim()
        if (t) out.push(t)
      }
      for (const el of document.querySelectorAll('[aria-label],[title],img[alt]')) for (const a of ['aria-label', 'title', 'alt']) { const v = el.getAttribute(a); if (v) out.push(v) }
      return out
    })
    found.forEach((s) => strings.add(s))
    await close()
  }
  await grab(ctx.base)
  await grab(ctx.base + '#/blog/this-post-does-not-exist')
  const html = await ctx.getText('')
  for (const m of html.matchAll(/<meta\s+(?:name|property)="(?:description|og:[a-z:]+|twitter:[a-z:]+|author)"\s+content="([^"]*)"/g)) strings.add(m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"'))
  strings.add(html.match(/<title>([^<]*)<\/title>/)[1])
  for (const m of (await ctx.getText('feed.xml')).matchAll(/<(?:title|description)>([^<]*)</g)) strings.add(m[1])
  Object.values({ ...c.site, ...c.person }).filter((v) => typeof v === 'string').forEach((v) => strings.add(v))
  const all = [...strings]
  const joined = all.join('\n')

  const dashes = all.filter((t) => /[—–]|--/.test(t))
  ok(`no em-dash, en-dash, or double hyphen in any of the ${all.length} strings a visitor can read or hear`, dashes.length === 0, dashes[0])
  ok('no English test score is mentioned (IELTS and similar)', !/\bIELTS\b|\bTOEFL\b|\bPTE\b/i.test(joined))
  ok('the thesis is never described as something that was built ("built a federated learning system")', !/built a federated learning system/i.test(joined))
  ok('the degree is "Computer Science", never "Computer Science and Engineering"', !/Computer Science and Engineering/i.test(joined) && c.education.degree === 'B.Sc. in Computer Science')
  ok('no TODO, placeholder, or filler text is visible on the live page', !/\bTODO\b|lorem ipsum|placeholder/i.test(joined))
  ok('"Manuscripts in preparation" appears only if the data says it is true', c.manuscriptsInPreparation || !/manuscripts? in preparation/i.test(joined))
  const stiff = STIFF.filter((w) => joined.toLowerCase().includes(w))
  ok('none of the stiff or machine-sounding words and phrases on the watch list appear', stiff.length === 0, stiff.join(', '))
  const bio = sentences(c.person.bio).length
  ok('the bio is 3 to 5 sentences', bio >= 3 && bio <= 5, `${bio} sentences`)
  const research = c.research.map((r) => [r.title, sentences(r.description).length]).filter(([, n]) => n < 2 || n > 3)
  ok('every research description is 2 to 3 sentences', research.length === 0, research.map(([t, n]) => `${t}: ${n}`).join(', '))
  const longest = Math.max(...[c.person.bio, ...c.research.map((r) => r.description)].flatMap((t) => sentences(t)).map((s) => s.split(/\s+/).length))
  ok('no sentence in the bio or research text is longer than 30 words', longest <= 30, `longest is ${longest}`)
  ok('"PhD", "Computer Science", and the name are written the same way everywhere', !/\bPh\.D|\bphd\b|\bPHD\b|\bPhd\b/.test(joined) && !/computer science/.test(joined.replace(/Computer Science/g, '')) && !/Md\. Labibul|Mohammad Labibul/.test(joined))
}
