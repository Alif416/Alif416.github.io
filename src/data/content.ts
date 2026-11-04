// All site text and links live here. Edit this file to change the site.
// Missing values are `null` (the UI hides them) or empty arrays.
// Do not use em-dashes or double dashes in any text.

import type { Content } from './types.ts'

export const content: Content = {
  site: {
    title: 'Md Labibul Ahsan Alif',
    pageTitle: 'Md Labibul Ahsan Alif | AI security and machine learning',
    description:
      'Personal website of Md Labibul Ahsan Alif, a Computer Science graduate from BRAC University, looking for PhD opportunities in AI security and machine learning.',
    url: 'https://alif416.github.io/',
  },

  person: {
    name: 'Md Labibul Ahsan Alif',
    shortName: 'Alif',
    location: 'Dhaka, Bangladesh',
    headline:
      'Computer Science graduate, looking for PhD opportunities in AI security and machine learning',
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

  nav: [
    { id: 'about', label: 'About', heading: 'Md Labibul Ahsan Alif' },
    { id: 'research', label: 'Research', heading: 'Research' },
    { id: 'projects', label: 'Projects', heading: 'Projects' },
    { id: 'blog', label: 'Blog', heading: 'Blog and Notes' },
    { id: 'contact', label: 'Contact', heading: 'Contact' },
  ],

  research: ['AI security', 'Adversarial machine learning', 'Natural language processing', 'Federated learning'],

  thesis: {
    title: 'Remote patient monitoring system driven by federated learning',
    supervisor: 'Mr. Moin Mostakim',
    year: 2026,
    abstract: null, // TODO: Alif to provide
    pdfUrl: null, // TODO: Alif to provide
    codeUrl: null, // TODO: Alif to provide
  },

  projects: [
    {
      title: 'LevelUp: AI-powered interview preparation platform',
      // Taken from the date the GitHub repository was created. Alif to confirm.
      date: 'May 2026',
      // Drafted from the project's README. Alif to confirm the wording.
      summary:
        'A platform for practising technical interviews. Candidates can take AI mock interviews, where Claude scores each answer and gives feedback on strengths and what to improve. Interviewers can invite candidates into private live rooms with a shared code editor. It also has a bank of practice problems, charts of past interview scores, and accounts with roles for candidates, interviewers, and admins. It is deployed as a live demo.',
      tech: ['React', 'Express', 'PostgreSQL', 'Prisma', 'Socket.IO', 'Yjs', 'Redis', 'Claude API'],
      githubUrl: 'https://github.com/Alif416/ai-interview-platform',
      demoUrl: 'https://ai-interview-platform-sandy-one.vercel.app/',
    },
  ],
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
    },
  },
}
