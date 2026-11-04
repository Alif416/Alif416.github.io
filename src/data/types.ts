// Types for src/data/content.ts.
// Anything that may not exist yet is `null` (the UI hides it) or an empty array.

export type SectionId =
  | 'about'
  | 'research'
  | 'thesis'
  | 'projects'
  | 'blog'
  | 'cv'
  | 'contact'

export interface Site {
  // The site's name, for example in feed readers and link previews
  title: string
  // The text in the browser tab and in search results
  pageTitle: string
  description: string
  url: string
}

export interface Photo {
  src: string
  alt: string
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
  // e.g. "November 2026"; null until Alif provides it
  lastUpdated: string | null
}

export interface Documents {
  cv: Document
  transcript: Document
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
  // Shown in the Blog section while there are no published posts.
  blogEmptyMessage: string
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
