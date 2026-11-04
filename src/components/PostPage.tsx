import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { findPost, loadPostBody } from '../blog/posts'
import { readableDate } from '../blog/format'
import { content } from '../data/content'
import './PostPage.css'

type Loaded = { slug: string; html: string } | { slug: string; failed: true }

// One blog post. The details come from the list data; the body is loaded when the
// post is opened, so it stays out of the main bundle.
export default function PostPage({ slug }: { slug: string }) {
  const post = findPost(slug)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (!post) return
    let cancelled = false
    loadPostBody(slug)
      .then((html) => !cancelled && setLoaded({ slug, html }))
      .catch(() => !cancelled && setLoaded({ slug, failed: true }))
    return () => {
      cancelled = true
    }
  }, [slug, post])

  // Opening a post starts at the top with focus on the title, for keyboard and screen readers.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    titleRef.current?.focus({ preventScroll: true })
  }, [slug])

  useEffect(() => {
    const original = document.title
    document.title = `${post ? post.title : 'Post not found'} | ${content.person.name}`
    return () => {
      document.title = original
    }
  }, [post])

  // A link to a heading inside the post (for example #notes) scrolls there without
  // leaving the post. The address bar uses # for pages, so it must not change.
  const onBodyClick = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest('a')
    const href = link?.getAttribute('href')
    if (!href || !href.startsWith('#') || href.startsWith('#/')) return
    event.preventDefault()
    const target = document.getElementById(decodeURIComponent(href.slice(1)))
    if (target && bodyRef.current?.contains(target)) {
      target.scrollIntoView({ behavior: 'instant' })
    }
  }

  const back = (
    <a className="post__back" href="#blog">
      <span aria-hidden="true">&larr; </span>
      Back to Blog and Notes
    </a>
  )

  if (!post) {
    return (
      <div className="post container">
        {back}
        <h1 ref={titleRef} tabIndex={-1}>
          Post not found
        </h1>
        <p>This post does not exist, or it has not been published yet.</p>
      </div>
    )
  }

  const ready = loaded?.slug === slug ? loaded : null

  return (
    <article className="post container" aria-labelledby="post-title">
      {back}
      <header className="post__header">
        <h1 id="post-title" ref={titleRef} tabIndex={-1}>
          {post.title}
        </h1>
        <p className="post__meta">
          <time dateTime={post.date}>{readableDate(post.date)}</time>
          <span aria-hidden="true"> | </span>
          <span>{post.readingTime} min read</span>
        </p>
        {post.tags.length > 0 && (
          <ul className="post__tags" aria-label="Tags">
            {post.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </header>

      {ready === null && (
        <p className="muted" role="status">
          Loading post...
        </p>
      )}
      {ready && 'failed' in ready && (
        <p role="alert">This post could not be loaded. Please try again.</p>
      )}
      {ready && 'html' in ready && (
        // The HTML is made from the author's own Markdown at build time, with scripts removed.
        <div
          ref={bodyRef}
          className="post__body"
          onClick={onBodyClick}
          dangerouslySetInnerHTML={{ __html: ready.html }}
        />
      )}
    </article>
  )
}
