import { posts, postHref } from '../blog/posts'
import { content } from '../data/content'
import Section from './Section'
import './Blog.css'

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

// "2026-03-01" -> "1 March 2026"
const readableDate = (date: string): string => dateFormat.format(new Date(`${date}T00:00:00Z`))

export default function Blog() {
  const nav = content.nav.find((item) => item.id === 'blog')

  return (
    <Section id="blog" heading={nav?.heading ?? 'Blog and Notes'}>
      {posts.length === 0 ? (
        <p className="muted">{content.blogEmptyMessage}</p>
      ) : (
        <ul className="blog-list">
          {posts.map((post) => (
            <li key={post.slug} className="blog-post">
              <p className="blog-post__meta">
                <time dateTime={post.date}>{readableDate(post.date)}</time>
                <span aria-hidden="true"> | </span>
                <span>{post.readingTime} min read</span>
              </p>
              <h3 className="blog-post__title">
                <a href={postHref(post.slug)}>{post.title}</a>
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
      )}
    </Section>
  )
}
