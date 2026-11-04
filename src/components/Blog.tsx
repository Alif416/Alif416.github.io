import { readableDate } from '../blog/format'
import { posts, postHref } from '../blog/posts'
import { content } from '../data/content'
import { rememberHomeScroll } from '../router'
import Section from './Section'
import './Blog.css'

// The Blog section. It is only shown when at least one post is published (see src/nav.ts).
export default function Blog() {
  const nav = content.nav.find((item) => item.id === 'blog')

  return (
    <Section id="blog" heading={nav?.heading ?? 'Blog and Notes'}>
      <p className="blog__feed">
        <a className="chip" href={`${import.meta.env.BASE_URL}feed.xml`} type="application/rss+xml">
          RSS feed
        </a>
      </p>
      <ul className="blog-list">
        {posts.map((post) => (
          <li key={post.slug} className="blog-post">
            <p className="blog-post__meta">
              <time dateTime={post.date}>{readableDate(post.date)}</time>
              <span aria-hidden="true"> | </span>
              <span>{post.readingTime} min read</span>
            </p>
            <h3 className="blog-post__title">
              <a href={postHref(post.slug)} onClick={rememberHomeScroll}>
                {post.title}
              </a>
            </h3>
            <p className="blog-post__summary">{post.summary}</p>
            {post.tags.length > 0 && (
              <ul className="blog-post__tags" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}
