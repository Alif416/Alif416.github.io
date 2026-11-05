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
      'Large language models are powerful. I want to make them safe to trust.',
    bio: "I'm Alif, a Computer Science graduate from BRAC University in Dhaka, Bangladesh. I'm interested in large language models and how to secure them, along with adversarial machine learning, natural language processing, and federated learning. My undergraduate thesis, supervised by Mr. Moin Mostakim, looked at a remote patient monitoring system driven by federated learning. I'm now looking for PhD opportunities where I can keep working on trustworthy and secure machine learning.",
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

  papers: [
    {
      kind: 'Undergraduate thesis',
      title: 'Remote patient monitoring system driven by federated learning',
      meta: 'Supervised by Mr. Moin Mostakim, 2026',
      date: '2026',
      abstract: null, // TODO: Alif to provide
      pdfUrl: null, // TODO: Alif to provide
      codeUrl: null, // TODO: Alif to provide
    },
  ],

  projects: [
    {
      title: 'Brain Tumor Segmentation',
      // From the PhD CV. Alif to add the Kaggle link (and a date if wanted).
      date: null,
      summary:
        'A comparison of U-Net and Attention U-Net for segmenting glioma, meningioma, and pituitary tumors in brain MRI scans from the BRISC dataset. The two models scored almost the same, with mean Dice 0.837 for U-Net and 0.838 for Attention U-Net, so attention gave no clear gain.',
      tech: ['PyTorch', 'U-Net', 'Attention U-Net', 'Brain MRI'],
      githubUrl: null,
      demoUrl: null,
    },
    {
      title: 'LoanIQ: credit risk ML pipeline',
      // From the PhD CV. The date is when the GitHub repository was created.
      date: 'Jun 2025',
      summary:
        'A credit default model trained on LendingClub loans. I split the data by time (train 2007 to 2016, test 2017 to 2018, 206,082 loans) and used 22 features known when a loan is made, to avoid leakage. XGBoost scored best of four models, with ROC-AUC 0.716 against about 0.85 on a leaky random split. Tuning the threshold raised default recall from 1% to 43%. It has TreeSHAP explanations, 48 tests, and CI.',
      tech: ['Python', 'XGBoost', 'scikit-learn', 'TreeSHAP', 'pytest', 'GitHub Actions', 'Streamlit'],
      githubUrl: 'https://github.com/Alif416/LoanIQ',
      demoUrl: 'https://loan-prediction-ml-k4xffncvhbyh7h9qy72mjk.streamlit.app/',
    },
    {
      title: 'VAE-based music clustering',
      // From the PhD CV. The date is when the GitHub repository was created.
      date: 'Jan 2026',
      summary:
        'A course project for Neural Networks. It compares VAE variants with PCA and raw-feature baselines for clustering 312 GTZAN music clips from 4 genres. PCA did best (purity 0.63) and Conv-VAE was the best deep model (0.38), with overfitting on the small dataset. The lyrics inputs were stand-ins, not real lyrics.',
      tech: ['PyTorch', 'VAE', 'β-VAE', 'Conv-VAE', 'CVAE', 'K-Means', 'PCA'],
      githubUrl: 'https://github.com/Alif416/vae-hybrid-language-music-clustering',
      demoUrl: null,
    },
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
