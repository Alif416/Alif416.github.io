---
title: "Placeholder: how code looks"
date: 2026-11-03
tags: [placeholder, code]
summary: A placeholder that shows highlighted code in several languages, plain code, and a very long line. It is a draft and is never published.
draft: true
---

This is a placeholder post for code samples. It makes no claims and is a draft, so it never appears on the live site.

A short Python sample:

```python
def add(a, b):
    # Add two numbers
    return a + b

print(add(2, 3))
```

A TypeScript sample:

```typescript
interface Point {
  x: number
  y: number
}

const origin: Point = { x: 0, y: 0 }
console.log(`Origin is at ${origin.x}, ${origin.y}`)
```

A shell sample:

```bash
npm install
npm run build
```

A block with no language is shown as plain text:

```
Just some plain text
    with indentation kept
```

A block with a language that is not known is also plain:

```foobar
this language does not exist
```

And one very long line, which should scroll inside its block and not widen the page:

```python
print("this is a very long line of sample code that keeps going and going so that it is wider than the screen on a phone, which checks that the code block scrolls on its own and the page does not")
```

Inline code such as `npm run dev` also works.
