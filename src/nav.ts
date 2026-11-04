import { posts } from './blog/posts'
import { content } from './data/content'

// The Blog section and its menu link appear only once at least one post is published,
// so visitors never see an empty section. Everything that lists sections uses this.
export const hasBlog = posts.length > 0

export const navItems = content.nav.filter((item) => item.id !== 'blog' || hasBlog)

export const sectionIds = navItems.map((item) => item.id)
