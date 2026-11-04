// A small reporter: every check has a plain-English name and a pass or fail.

const useColour = process.stdout.isTTY
const paint = (code, text) => (useColour ? `\u001b[${code}m${text}\u001b[0m` : text)

export function createReporter(suiteName, variant) {
  const results = []
  const label = variant ? `${suiteName} (${variant})` : suiteName

  const ok = (name, condition, detail = '') => {
    const passed = Boolean(condition)
    results.push({ name, passed, detail })
    const shownDetail = detail === '' || detail === undefined ? '' : `  [${String(detail).slice(0, 240)}]`
    console.log(`${passed ? paint('32', 'PASS') : paint('31', 'FAIL')} ${label}: ${name}${shownDetail}`)
    return passed
  }

  // Use when a check cannot run here, so nobody mistakes "not run" for "passed".
  const skip = (name, reason) => {
    results.push({ name, passed: true, skipped: true, detail: reason })
    console.log(`${paint('33', 'SKIP')} ${label}: ${name}  [${reason}]`)
  }

  return { ok, skip, results, label }
}

export function summarise(allResults) {
  const flat = allResults.flatMap((r) => r.results.map((x) => ({ ...x, suite: r.label })))
  const failed = flat.filter((x) => !x.passed)
  const skipped = flat.filter((x) => x.skipped)
  const passed = flat.length - failed.length - skipped.length
  console.log('\n' + '-'.repeat(60))
  console.log(`${passed} passed, ${failed.length} failed, ${skipped.length} skipped, ${flat.length} checks in total`)
  if (failed.length > 0) {
    console.log(paint('31', '\nFailed checks:'))
    failed.forEach((x) => console.log(`  - ${x.suite}: ${x.name}${x.detail ? '  [' + String(x.detail).slice(0, 200) + ']' : ''}`))
  }
  console.log(failed.length === 0 ? paint('32', 'ALL CHECKS PASSED') : paint('31', 'SOME CHECKS FAILED'))
  return failed.length
}
