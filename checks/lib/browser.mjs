import puppeteer from 'puppeteer-core'
import { findChrome } from './env.mjs'

export const launch = (options = {}) =>
  puppeteer.launch({ executablePath: findChrome(), headless: true, ...options })

// Opens a page with a chosen size, colour scheme, and motion setting, and collects console errors.
export async function openPage(browser, url, { width = 1280, height = 900, scheme = 'light', reduced = true, wait } = {}) {
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  await page.setViewport({ width, height })
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: scheme },
    { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' },
  ])
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  await page.goto(url, { waitUntil: 'networkidle0' })
  if (wait) await page.waitForSelector(wait, { timeout: 8000 })
  return { page, errors, close: () => context.close() }
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Contrast ratio between two [r, g, b] colours.
const luminance = ([r, g, b]) => {
  const c = [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
