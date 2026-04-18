/**
 * mockData.js — Extended with per-level question banks
 * ─────────────────────────────────────────────────────────────
 * Questions are separated into Beginner / Intermediate / Advanced
 * so the adaptive engine always has material to pick from.
 */

export const DEMO_PROFILE = {
  name: 'Arjun Sharma',
  email: 'arjun.sharma@gmail.com',
  phone: '+91 98765 43210',
  location: 'Hyderabad, Telangana',
  domain: 'Software Engineering',
  experience: 2,
  job_type: 'Full-time',
  skills: ['Python', 'FastAPI', 'SQL', 'React', 'Git', 'REST APIs'],
  summary:
    'Results-driven software developer with 2 years of experience building scalable REST APIs and data-driven web apps.',
  education: [
    { degree: 'B.Tech in Computer Science', institution: 'JNTU Hyderabad', year: '2022', gpa: '8.2/10' },
  ],
  work_experience: [
    {
      title: 'Backend Developer', company: 'TechStart Pvt Ltd', duration: '2 years', location: 'Hyderabad',
      description: 'Built REST APIs with FastAPI and PostgreSQL for a fintech platform serving 50K users.',
    },
  ],
  projects: [
    { name: 'AI Resume Analyzer', tech: 'Python, spaCy, FastAPI', description: 'NLP tool to parse resumes and rank candidates by job fit. Processed 1000+ resumes.', github: 'https://github.com' },
    { name: 'Real-time Chat App', tech: 'React, Node.js, Socket.IO', description: 'Chat application with real-time messaging for 500+ concurrent users.', github: 'https://github.com' },
  ],
  certifications: ['Google Data Analytics Certificate', 'AWS Cloud Practitioner'],
};

/* ── Adaptive question bank ────────────────────────────────── */
export const ADAPTIVE_QUESTIONS = {
  'Software Engineering': {
    Beginner: [
      'What is a variable and how is it used in programming?',
      'Explain the difference between a list and a dictionary.',
      'What does version control mean, and why is it important?',
      'What is a function? Write an example in Python.',
      'What is the difference between frontend and backend development?',
      'What is debugging and how do you approach it?',
      'Explain what an API is in simple terms.',
      'What is the purpose of Git?',
    ],
    Intermediate: [
      'Tell me about yourself and your programming background.',
      'What is the difference between a stack and a queue?',
      'Explain the concept of RESTful APIs.',
      'How do you handle version control in a team environment?',
      'Describe a challenging bug you fixed and your approach.',
      'What is Object-Oriented Programming? Explain its four pillars.',
      'How do you ensure your code is clean and maintainable?',
      "What's the difference between SQL and NoSQL databases?",
      'Explain time complexity and give an O(n log n) example.',
      'What is the difference between synchronous and asynchronous code?',
    ],
    Advanced: [
      'Design a URL shortener system like bit.ly — discuss tradeoffs.',
      'How would you design a rate limiter for a public API?',
      'Explain CAP theorem and where PostgreSQL sits within it.',
      'What is the difference between optimistic and pessimistic locking?',
      'Describe your approach to designing a microservices architecture.',
      'How does the JVM garbage collector work? How can you tune it?',
      'Explain the SOLID principles with a concrete code example.',
      'What is database sharding and when would you apply it?',
    ],
  },
  'Data & Analytics': {
    Beginner: [
      'What is data analysis and why is it important?',
      'What is the difference between mean, median, and mode?',
      'What is a spreadsheet formula you use regularly?',
      'Explain what a bar chart is used for.',
      'What does "cleaning data" mean?',
    ],
    Intermediate: [
      'How do you handle missing values in a dataset?',
      'Describe a project where your analysis led to a business decision.',
      'How would you create a dashboard using Power BI?',
      'Explain the concept of A/B testing.',
      'What SQL query would you use to find duplicate records?',
      'How do you communicate insights to non-technical stakeholders?',
    ],
    Advanced: [
      'Explain the difference between OLAP and OLTP and when to use each.',
      'How would you design a real-time analytics pipeline for 10M events/day?',
      'What is the curse of dimensionality and how do you address it?',
      'Explain cohort analysis — build an SQL query to compute 30-day retention.',
      'How does Spark differ from MapReduce for distributed data processing?',
    ],
  },
  'AI/ML': {
    Beginner: [
      'What is machine learning in simple terms?',
      'What is the difference between supervised and unsupervised learning?',
      'Name three real-world applications of AI.',
      'What is training data and why is it important?',
    ],
    Intermediate: [
      'Explain overfitting and how you would prevent it.',
      'How does gradient descent work?',
      'Explain precision vs recall and when each matters.',
      'Describe a machine learning project you have built.',
      'What is transfer learning and when would you use it?',
      'How do you handle class imbalance in a dataset?',
    ],
    Advanced: [
      'Explain the transformer architecture at a high level.',
      'What is the vanishing gradient problem and how do residual networks address it?',
      'Design an ML pipeline for real-time fraud detection at 1M tx/sec.',
      'Compare RLHF vs DPO for LLM alignment — tradeoffs?',
      'How would you implement a recommendation system for cold-start users?',
      'Explain contrastive learning and give a use-case.',
    ],
  },
  General: {
    Beginner: [
      'Tell me about yourself.',
      'Why do you want this job?',
      'What are your greatest strengths?',
    ],
    Intermediate: [
      'Where do you see yourself in 5 years?',
      'Describe a time you worked under pressure.',
      'What motivates you in your work?',
      'Tell me about a conflict with a teammate and how you resolved it.',
    ],
    Advanced: [
      'Why should we hire you over other candidates?',
      'Describe a time you led a team through ambiguity.',
      'Tell me about a decision you made with incomplete information.',
      'How do you prioritize when everything is a priority?',
    ],
  },
};

/* Keep flat MOCK_INTERVIEW_QA for backward compat */
export const MOCK_INTERVIEW_QA = Object.fromEntries(
  Object.entries(ADAPTIVE_QUESTIONS).map(([domain, levels]) => [
    domain,
    [...levels.Beginner, ...levels.Intermediate, ...levels.Advanced],
  ])
);

export const MOCK_JOBS = [
  { id: 'j001', title: 'Python Backend Developer', company: 'TechNova Pvt Ltd', location: 'Hyderabad (Remote)', type: 'Full-time', salary: '₹6–10 LPA', skills: ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs', 'Docker'], domain: 'Software Engineering', match_score: 87, matched_skills: ['Python', 'FastAPI', 'REST APIs'], missing_skills: ['PostgreSQL', 'Docker'], match_reason: 'Matched because of: Python, FastAPI, REST APIs' },
  { id: 'j002', title: 'Data Analyst', company: 'Analytics Hub', location: 'Bangalore', type: 'Full-time', salary: '₹4–7 LPA', skills: ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics'], domain: 'Data & Analytics', match_score: 74, matched_skills: ['Python', 'SQL'], missing_skills: ['Power BI', 'Excel', 'Statistics'], match_reason: 'Matched because of: Python, SQL' },
  { id: 'j003', title: 'Machine Learning Engineer', company: 'AI Ventures', location: 'Remote', type: 'Full-time', salary: '₹10–18 LPA', skills: ['Python', 'scikit-learn', 'TensorFlow', 'ML', 'SQL', 'NLP'], domain: 'AI/ML', match_score: 61, matched_skills: ['Python', 'SQL'], missing_skills: ['scikit-learn', 'TensorFlow', 'NLP'], match_reason: 'Matched because of: Python, SQL' },
  { id: 'j004', title: 'Full Stack Developer', company: 'StartUpX', location: 'Remote', type: 'Contract', salary: '₹8–14 LPA', skills: ['React', 'Node.js', 'MongoDB', 'Python', 'REST APIs', 'Git'], domain: 'Full Stack', match_score: 79, matched_skills: ['React', 'Python', 'REST APIs', 'Git'], missing_skills: ['Node.js', 'MongoDB'], match_reason: 'Matched because of: React, Python, REST APIs, Git' },
  { id: 'j005', title: 'Frontend Developer', company: 'PixelCraft Studios', location: 'Pune (Hybrid)', type: 'Full-time', salary: '₹5–9 LPA', skills: ['React', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS', 'Git'], domain: 'Frontend', match_score: 55, matched_skills: ['React', 'Git'], missing_skills: ['JavaScript', 'Tailwind CSS', 'HTML'], match_reason: 'Matched because of: React, Git' },
  { id: 'j006', title: 'DevOps Engineer', company: 'CloudBase India', location: 'Chennai', type: 'Full-time', salary: '₹9–15 LPA', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Python'], domain: 'DevOps', match_score: 42, matched_skills: ['Python'], missing_skills: ['Docker', 'Kubernetes', 'AWS'], match_reason: 'Matched because of: Python' },
  { id: 'j007', title: 'NLP Research Engineer', company: 'AI Research Labs', location: 'Remote', type: 'Full-time', salary: '₹12–20 LPA', skills: ['Python', 'NLP', 'spaCy', 'BERT', 'TensorFlow', 'ML'], domain: 'AI/ML', match_score: 48, matched_skills: ['Python'], missing_skills: ['NLP', 'spaCy', 'BERT', 'ML'], match_reason: 'Matched because of: Python' },
  { id: 'j008', title: 'Business Analyst', company: 'ConsultPro', location: 'Delhi (Hybrid)', type: 'Full-time', salary: '₹5–8 LPA', skills: ['Excel', 'SQL', 'PowerPoint', 'Communication', 'Statistics'], domain: 'Business', match_score: 35, matched_skills: ['SQL'], missing_skills: ['Excel', 'PowerPoint', 'Communication'], match_reason: 'Matched because of: SQL' },
];

export const LEARNING_PATHS = {
  Python: [
    { name: 'Python for Everybody', url: 'https://coursera.org/learn/python', duration: '4 weeks', free: true },
    { name: 'Automate the Boring Stuff', url: 'https://automatetheboringstuff.com', duration: '3 weeks', free: true },
  ],
  SQL: [
    { name: 'SQLZoo Interactive', url: 'https://sqlzoo.net', duration: '2 weeks', free: true },
    { name: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial', duration: '1 week', free: true },
  ],
  React: [
    { name: 'React Official Docs', url: 'https://react.dev', duration: '3 weeks', free: true },
    { name: 'Scrimba React Course', url: 'https://scrimba.com', duration: '4 weeks', free: false },
  ],
  ML: [
    { name: 'Fast.ai Deep Learning', url: 'https://fast.ai', duration: '8 weeks', free: true },
    { name: 'Kaggle ML Courses', url: 'https://kaggle.com/learn', duration: '3 weeks', free: true },
  ],
  Docker: [
    { name: 'Docker Getting Started', url: 'https://docs.docker.com', duration: '1 week', free: true },
    { name: 'Docker & Kubernetes — KodeKloud', url: 'https://kodekloud.com', duration: '3 weeks', free: false },
  ],
  AWS: [
    { name: 'AWS Free Tier Tutorials', url: 'https://aws.amazon.com/getting-started', duration: '4 weeks', free: true },
    { name: 'Cloud Practitioner Essentials', url: 'https://aws.amazon.com/training', duration: '6 weeks', free: true },
  ],
  'Power BI': [
    { name: 'Microsoft Power BI Learning', url: 'https://learn.microsoft.com/en-us/power-bi', duration: '2 weeks', free: true },
    { name: 'Udemy Power BI Course', url: 'https://udemy.com', duration: '4 weeks', free: false },
  ],
  NLP: [
    { name: 'HuggingFace NLP Course', url: 'https://huggingface.co/learn', duration: '6 weeks', free: true },
    { name: 'Kaggle NLP Starter', url: 'https://kaggle.com/learn', duration: '2 weeks', free: true },
  ],
  default: [
    { name: 'freeCodeCamp', url: 'https://freecodecamp.org', duration: '2–4 weeks', free: true },
    { name: 'YouTube Tutorials', url: 'https://youtube.com', duration: '1–2 weeks', free: true },
  ],
};
