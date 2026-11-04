// Runs the site's checks. See checks/README.md.
//
//   npm run check                          build the site, run every check
//   npm run check -- --quick               the main checks only (faster)
//   npm run check -- --url https://...     check a live address instead of building
//   npm run check -- --suite accessibility run one group only
//   npm run check -- --no-build            reuse the last build

import { spawnSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { launch } from './lib/browser.mjs'
import { expectations, loadContent, loadPosts } from './lib/content.mjs'
import { serveFolder } from './lib/env.mjs'
import { createReporter, summarise } from './lib/report.mjs'

const root = join(import.meta.dirname, '..')
const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const option = (name) => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] : undefined
}

const liveUrl = option('url')
const only = option('suite')
const quick = flag('quick')

// name, file, the builds it needs, and whether --quick includes it
const SUITES = [
  { name: 'build output', file: 'build.mjs', variants: ['prod'], quick: true },
  { name: 'page shell', file: 'shell.mjs', variants: ['prod', 'drafts'], quick: true },
  { name: 'content', file: 'content.mjs', variants: ['prod'], quick: true },
  { name: 'blog', file: 'blog.mjs', variants: ['prod', 'drafts'], quick: true },
  { name: 'photo', file: 'photo.mjs', variants: ['prod'], quick: true },
  { name: 'copy rules', file: 'copy.mjs', variants: ['prod'], quick: true },
  { name: 'accessibility', file: 'accessibility.mjs', variants: ['prod', 'drafts'], quick: false },
  { name: 'responsive', file: 'responsive.mjs', variants: ['prod', 'drafts'], quick: false },
]

const run = (command, commandArgs, env = {}) => {
  const result = spawnSync(command, commandArgs, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } })
  if (result.status !== 0) throw new Error(`"${command} ${commandArgs.join(' ')}" failed`)
}

const started = Date.now()
const servers = {}
let browser

try {
  const content = await loadContent(root)
  const posts = loadPosts(root)
  const selected = SUITES.filter((s) => (!only || s.name === only || s.file === `${only}.mjs`) && (!quick || s.quick))
  if (selected.length === 0) throw new Error(`No check group called "${only}". Groups: ${SUITES.map((s) => s.name).join(', ')}`)

  if (liveUrl) {
    servers.prod = { url: liveUrl.endsWith('/') ? liveUrl : liveUrl + '/', close: async () => {} }
    console.log(`Checking the live site: ${servers.prod.url}\n(checks that need draft posts are skipped on a live address)\n`)
  } else {
    if (!flag('no-build')) {
      console.log('Building the site...')
      run('npm', ['run', 'build'])
      console.log('\nBuilding a copy with draft posts visible, for checking only...')
      rmSync(join(root, '.checks-tmp/dist-drafts'), { recursive: true, force: true })
      run('npx', ['vite', 'build', '--outDir', '.checks-tmp/dist-drafts', '--emptyOutDir'], { VITE_SHOW_DRAFTS: '1' })
    }
    servers.prod = await serveFolder(join(root, 'dist'))
    servers.prod.dir = join(root, 'dist')
    servers.drafts = await serveFolder(join(root, '.checks-tmp/dist-drafts'))
    servers.drafts.dir = join(root, '.checks-tmp/dist-drafts')
  }

  browser = await launch()
  const reporters = []

  for (const suite of selected) {
    const module = await import(`./suites/${suite.file}`)
    for (const variant of suite.variants) {
      const server = servers[variant]
      const reporter = createReporter(suite.name, suite.variants.length > 1 ? variant : '')
      if (!server) {
        reporter.skip('all checks in this group', `needs the draft-posts build, which is not available for a live address`)
        reporters.push(reporter)
        continue
      }
      const expected = expectations(content, posts, variant)
      const context = {
        root,
        content,
        posts,
        expected,
        variant,
        live: Boolean(liveUrl),
        quick,
        base: server.url,
        distDir: server.dir,
        browser,
        getText: async (path) => (await fetch(server.url + path.replace(/^\//, ''))).text(),
        getBuffer: async (path) => Buffer.from(await (await fetch(server.url + path.replace(/^\//, ''))).arrayBuffer()),
        getStatus: async (path) => (await fetch(server.url + path.replace(/^\//, ''))).status,
      }
      try {
        await module.default(context, reporter)
      } catch (error) {
        reporter.ok('the group ran without crashing', false, error.stack?.split('\n').slice(0, 3).join(' | ') ?? String(error))
      }
      reporters.push(reporter)
    }
  }

  const failures = summarise(reporters)
  console.log(`Finished in ${Math.round((Date.now() - started) / 1000)} seconds.`)
  process.exitCode = failures === 0 ? 0 : 1
} catch (error) {
  console.error('\n' + (error.message ?? error))
  process.exitCode = 2
} finally {
  await browser?.close()
  await Promise.all(Object.values(servers).map((s) => s.close()))
}
