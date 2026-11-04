// Finding Chrome, free ports, and a tiny static web server for the built site.

import { existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const CHROME_PLACES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
]

export function findChrome() {
  const fromEnv = process.env.CHROME_PATH
  if (fromEnv && existsSync(fromEnv)) return fromEnv
  const found = CHROME_PLACES.find((place) => existsSync(place))
  if (!found) {
    throw new Error(
      'Chrome was not found. Install Google Chrome, or set CHROME_PATH to the Chrome program, for example:\n' +
        '  CHROME_PATH="/path/to/chrome" npm run check',
    )
  }
  return found
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/vnd.microsoft.icon',
  '.woff2': 'font/woff2',
}

// Serves a folder (the built site) on a free port. Returns the address and a way to stop it.
export function serveFolder(folder) {
  return new Promise((resolve, reject) => {
    const server = createServer((request, response) => {
      const path = decodeURIComponent(new URL(request.url, 'http://x').pathname)
      let file = normalize(join(folder, path))
      if (!file.startsWith(normalize(folder))) {
        response.statusCode = 403
        return response.end()
      }
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
      if (!existsSync(file)) {
        response.statusCode = 404
        return response.end('Not found')
      }
      response.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream')
      response.end(readFileSync(file))
    })
    server.on('error', reject)
    // Port 0 asks the system for any free port.
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ url: `http://127.0.0.1:${port}/`, close: () => new Promise((done) => server.close(done)) })
    })
  })
}
