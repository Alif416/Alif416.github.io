// Types for src/data/content.ts.
// Anything that may not exist yet is `null` (the UI hides it) or an empty array.

export type SectionId =
  | 'about'
  | 'research'
  | 'thesis'
  | 'projects'
  | 'blog'
  | 'contact'

export interface Site {
  // The site's name, for example in feed readers and link previews
  title: string
  // The text in the browser tab and in search results
  pageTitle: string
  description: string
  url: string
}

// Another version of the photo in a different format. The browser uses the first one it supports.
export interface PhotoSource {
  // For example "image/webp"
  type: string
  // File and width pairs, for example "/photo-192.webp 192w, /photo-384.webp 384w"
  srcSet: string
}

export interface Photo {
  // The main file, also used by browsers that do not understand the options below
  src: string
  alt: string
  // Same photo at smaller sizes in the main format, for example "/photo-192.jpg 192w, /photo-384.jpg 384w"
  srcSet?: string
  // Same photo in other formats, best first
  sources?: PhotoSource[]
}

export interface Person {
  name: string
  shortName: string
  location: string
  headline: string
  researchStatement: string
  bio: string
  // null until a photo is uploaded; the UI shows a placeholder instead
  photo: Photo | null
}

// Stored in parts so the UI can obfuscate it lightly.
export interface Email {
  user: string
  domain: string
}

export interface Links {
  email: Email | null
  github: string | null
  linkedin: string | null
  scholar: string | null
  orcid: string | null
}

export interface NavItem {
  id: SectionId
  // Short text in the nav bar
  label: string
  // Heading shown at the top of the section
  heading: string
}

export interface ResearchInterest {
  title: string
  description: string
}

export interface Thesis {
  title: string
  supervisor: string
  year: number
  abstract: string | null
  pdfUrl: string | null
  codeUrl: string | null
}

export interface Publication {
  title: string
  authors: string[]
  venue: string
  year: number
  pdfUrl: string | null
  arxivUrl: string | null
  codeUrl: string | null
  slidesUrl: string | null
}

export interface Project {
  title: string
  summary: string
  tech: string[]
  githubUrl: string | null
  demoUrl: string | null
}

export interface Education {
  university: string
  degree: string
  batch: string
  cgpa: string
}

export interface Document {
  // Button text
  label: string
  url: string
}

export interface Documents {
  cv: Document
}

// Details of one blog post, read from the frontmatter of a Markdown file in content/blog.
export interface Post {
  // From the filename, for example "my-first-note"
  slug: string
  title: string
  // YYYY-MM-DD
  date: string
  tags: string[]
  summary: string
  // Minutes
  readingTime: number
  draft: boolean
}

export interface Contact {
  // One sentence shown above the email. null means no intro is shown.
  intro: string | null
}

export interface Content {
  site: Site
  person: Person
  links: Links
  contact: Contact
  nav: NavItem[]
  research: ResearchInterest[]
  thesis: Thesis
  publications: Publication[]
  // Set to true only if Alif confirms he has manuscripts in preparation.
  manuscriptsInPreparation: boolean
  projects: Project[]
  // Shown in the Projects section while the projects list is empty.
  projectsEmptyMessage: string
  education: Education
  documents: Documents
}
