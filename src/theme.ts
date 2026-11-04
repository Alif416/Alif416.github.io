// Theme helpers. The inline script in index.html sets the first theme before paint;
// this file handles changes after that.

export type Theme = 'light' | 'dark'

const KEY = 'theme'

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Storage can be blocked. The theme still changes for this visit.
  }
}

export function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function currentTheme(): Theme {
  const attr = document.documentElement.dataset.theme
  return attr === 'dark' || attr === 'light' ? attr : systemTheme()
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}
