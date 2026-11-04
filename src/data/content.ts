// All site text and links live here. Edit this file to change the site.
// Missing values are `null` (the UI hides them) or empty arrays.
// Do not use em-dashes or double dashes in any text.

import type { Content } from './types.ts'

export const content: Content = {
  site: {
    title: 'Md Labibul Ahsan Alif',
    pageTitle: 'Md Labibul Ahsan Alif | AI security and machine learning',
    description:
      'Personal website of Md Labibul Ahsan Alif, a Computer Science graduate from BRAC University looking for PhD opportunities in AI security and machine learning.',
    url: 'https://alif416.github.io/',
  },

  person: {
    name: 'Md Labibul Ahsan Alif',
    shortName: 'Alif',
    location: 'Dhaka, Bangladesh',
    headline:
      'Computer Science graduate | Looking for PhD opportunities in AI security and machine learning',
    researchStatement:
      'I study how machine learning systems can be attacked and how to make them more trustworthy.',
    bio: "I'm Alif, a Computer Science graduate from BRAC University in Dhaka, Bangladesh. My research interests are AI security, adversarial machine learning, natural language processing, and federated learning. My undergraduate thesis, supervised by Mr. Moin Mostakim, looked at a remote patient monitoring system driven by federated learning. I'm now looking for PhD opportunities where I can keep working on trustworthy and secure machine learning.",
    // The photo is public/photo.jpg (420 x 420), with smaller copies (192 and 384 wide) in
    // JPEG and WebP. To change it, replace these files and regenerate
    // public/social-card.png (see design/social-card.html).
    photo: {
      src: '/photo.jpg',
      alt: 'Portrait of Md Labibul Ahsan Alif, smiling, in a dark blue suit and tie',
      srcSet: '/photo-192.jpg 192w, /photo-384.jpg 384w',
      sources: [{ type: 'image/webp', srcSet: '/photo-192.webp 192w, /photo-384.webp 384w' }],
    },
  },

  links: {
    email: { user: 'labibalif2001', domain: 'gmail.com' },
    github: 'https://github.com/Alif416',
    linkedin: 'https://www.linkedin.com/in/labibul-ahsan-alif-b70974291/',
    scholar: 'https://scholar.google.com/citations?user=LSZb0cQAAAAJ&hl=en',
    orcid: null, // not provided yet
  },

  contact: {
    // Suggested wording, not approved yet. To show it, replace null with the sentence:
    // 'If you work on AI security or machine learning and have a PhD opening, I would be glad to hear from you.'
    intro: null,
  },

  blogEmptyMessage: 'Notes are being added.',

  nav: [
    { id: 'about', label: 'About', heading: 'Md Labibul Ahsan Alif' },
    { id: 'research', label: 'Research', heading: 'Research' },
    { id: 'thesis', label: 'Thesis', heading: 'Thesis and Publications' },
    { id: 'projects', label: 'Projects', heading: 'Projects' },
    { id: 'blog', label: 'Blog', heading: 'Blog and Notes' },
    { id: 'cv', label: 'CV', heading: 'CV and Transcript' },
    { id: 'contact', label: 'Contact', heading: 'Contact' },
  ],

  // TODO: Alif to review. These are general explanations of each field and
  // make no claims about Alif's own work. Add your own details when ready.
  research: [
    {
      title: 'AI security',
      description:
        'AI security looks at how machine learning systems can be misused, attacked, or made to fail, and how to protect them. As AI shows up in more real products, these weak spots matter to everyday users and not only to researchers.',
    },
    {
      title: 'Adversarial machine learning',
      description:
        'Adversarial machine learning studies inputs that are crafted to fool a model, like an image or a sentence that is changed slightly so the model gives a wrong answer. The goal is to understand these attacks and build models that hold up against them.',
    },
    {
      title: 'Natural language processing',
      description:
        'Natural language processing is about getting computers to work with human language, from search and translation to chat assistants. I am interested in how these systems behave when the text they see is unusual or deliberately misleading.',
    },
    {
      title: 'Federated learning',
      description:
        'Federated learning trains a shared model across many devices or sites without moving the raw data to one place. This matters in healthcare, where patient data is sensitive and has to stay private. My thesis is on a remote patient monitoring system driven by this approach.',
    },
  ],

  thesis: {
    title: 'Remote patient monitoring system driven by federated learning',
    supervisor: 'Mr. Moin Mostakim',
    year: 2026,
    abstract: null, // TODO: Alif to provide
    pdfUrl: null, // TODO: Alif to provide
    codeUrl: null, // TODO: Alif to provide
  },

  // No formal publications yet. Add entries here if that changes.
  publications: [],

  // Only set to true if it is really the case. Shows "Manuscripts in preparation."
  manuscriptsInPreparation: false,

  // TODO: Alif to provide the final 3 to 5 projects.
  projects: [],
  projectsEmptyMessage: 'Projects are being added.',

  education: {
    university: 'BRAC University',
    degree: 'B.Sc. in Computer Science',
    batch: 'January 2026',
    cgpa: '3.40',
  },

  documents: {
    cv: {
      label: 'CV',
      url: 'https://drive.google.com/file/d/1gv0ED_YfjYtYTrVU0mwTi01HcdCSOwvv/view',
      lastUpdated: null, // TODO: Alif to provide, e.g. 'November 2026'
    },
    transcript: {
      label: 'Transcript',
      url: 'https://drive.google.com/file/d/1KTvQu5uPRasSIC5ZTtPULu_xyU0asy9p/view',
      lastUpdated: null,
    },
  },
}
