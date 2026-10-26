-- =====================================================================
-- Initial content, taken only from the resume and academic transcripts.
-- Run ONCE after 0001_init.sql. It replaces all portfolio content and
-- publishes the first version of the site.
-- Fields the resume does not state are left blank on purpose.
-- =====================================================================

update public.site_settings set data = $json$
{
  "profile": {
    "full_name": "Mohamad Fakhrullah bin Ibrahim",
    "short_name": "Fakhrullah",
    "title": "System Analyst",
    "headline": "I turn business requirements into clear specifications, system designs and testable solutions.",
    "intro": "System Analyst at HeiTech Padu Berhad, supporting a national immigration system for the Immigration Department of Malaysia. I write SRS and SDD documentation, design system and API flows, and prototype interfaces in Figma.",
    "process_steps": ["Requirements", "SRS & functional specs", "System & API design", "Wireframes & prototypes", "Testing & UAT", "Sign-off & support"],
    "location": "Cyberjaya, Malaysia",
    "availability": { "enabled": true, "text": "Open to System Analyst and Business Analyst opportunities" },
    "photo_path": "",
    "show_photo": true,
    "email": "yoifakrul@gmail.com",
    "phone": "014-2153722",
    "show_phone": false,
    "linkedin_url": "",
    "github_url": "",
    "other_links": []
  },
  "about": {
    "summary": [
      "I'm a System Analyst with hands-on experience in requirements analysis, system design documentation and back-end development. At HeiTech Padu Berhad I support Project NIISe (Sistem Imigresen Bersepadu Nasional) for the Immigration Department of Malaysia, where I author SRS and SDD documentation, design system and API flows, and produce UI/UX wireframes and interactive prototypes to CMMI-aligned standards.",
      "I studied Computer Science at Universiti Teknologi MARA (UiTM), building a technical base in backend development, databases and machine learning. I want to keep delivering well-documented, reliable systems for large-scale enterprise and government projects."
    ],
    "strengths": [
      "Requirements gathering and business process analysis",
      "SRS, SDD and functional specifications",
      "System flow, data flow and sequence diagrams",
      "API specifications and integration flows",
      "Figma wireframes and interactive prototypes",
      "System testing, API testing and UAT support"
    ],
    "interests": ["System Analyst", "Business Analyst", "Junior Business Analyst", "IT Executive", "Software Developer"],
    "languages": ["Bahasa Malaysia (native)", "English (professional working proficiency)"],
    "activities": [
      "Head of Publishing, Relex Club: led the creation, editing and publication of club materials.",
      "Head of Event, VistaVoyage Hike: organised the event end to end, covering logistics, budget, risk assessment and participant engagement."
    ]
  },
  "resume": { "path": "", "file_name": "", "updated_at": "", "show_preview": true },
  "seo": {
    "title": "Mohamad Fakhrullah bin Ibrahim | System Analyst",
    "description": "System Analyst in Malaysia specialising in requirements analysis, SRS and SDD documentation, system and API flow design, Figma prototyping and UAT support.",
    "og_image_path": ""
  },
  "theme": { "accent": "#2450D8", "default_mode": "light", "allow_toggle": true },
  "sections": { "about": true, "experience": true, "projects": true, "skills": true, "education": true, "resume": true, "contact": true },
  "contact": {
    "intro": "Hiring for a System Analyst, Business Analyst or IT role? Send a message and I'll reply by email.",
    "form_enabled": true
  }
}
$json$::jsonb
where id = 1;

delete from public.experiences where true;
insert into public.experiences (company, role, employment_type, work_mode, location, context, start_date, end_date, is_current, summary, highlights, tools, sort_order) values
(
  'HeiTech Padu Berhad', 'System Analyst', '', 'On-site', 'Cyberjaya, Malaysia',
  'Project NIISe, Immigration Department of Malaysia',
  '2026-02', '', true,
  'Analysis, specification and design documentation for a national immigration system, working with developers, testers and stakeholders.',
  array[
    'Analysed business and system requirements through stakeholder discussions, workflow studies and process documentation.',
    'Prepared SRS and SDD documentation, ensuring each module met client sign-off and CMMI documentation standards.',
    'Designed system flow diagrams, process workflows, functional specifications and system procedures used by developers as the build reference.',
    'Designed backend processes and API flows for integration across modules and external agencies.',
    'Prepared API specifications, request/response structures and data flow diagrams (DFD) for development and integration teams.',
    'Created sequence diagrams and wireflows to document system interactions and end-to-end user journeys.',
    'Produced UI/UX wireframes and interactive prototypes in Figma to align stakeholder expectations before development.',
    'Collaborated with developers, testers and stakeholders to translate business requirements into workable technical solutions.',
    'Conducted system testing, API testing, debugging and defect analysis, and supported User Acceptance Testing (UAT) through to sign-off.',
    'Provided application support and technical assistance during implementation and deployment.',
    'Documented existing processes and recommended system and process improvements to reduce manual handling.'
  ],
  array['Figma','SRS','SDD','DFD','Sequence diagrams','Wireflows','API specifications','UAT','CMMI'],
  1
),
(
  'IASME Group', 'Full-Stack Developer', 'Internship', '', '', '',
  '2025-03', '2025-06', false,
  'Built myIASME.com, a product management system for tracking products, sales performance and stock.',
  array[
    'Built myIASME.com, a product management system used to track products, sales performance and stock across four user roles.',
    'Developed core modules including product reporting, add/edit product features and dashboards computing profit, sales margin, ROI, stock levels, winning DNA insights and product proposals.',
    'Designed and implemented role-based access control for a multi-user environment.',
    'Deployed and maintained the system on GBNetwork hosting, handling real-world configuration and upkeep.'
  ],
  array[]::text[],
  2
),
(
  'LKPP Corporation', 'Web Developer', 'Internship', '', '', '',
  '2022-09', '2023-02', false,
  'Developed the e-Kenderaan vehicle booking project and supported internal communication materials.',
  array[
    'Developed the e-Kenderaan vehicle booking project using NetBeans and HeidiSQL, covering booking details, vehicle status and driver assignment.',
    'Redesigned the main user interface to give staff and administrators a clearer view of booking and vehicle status.',
    'Produced a six-minute video tutorial and supporting materials to train staff on the system.',
    'Designed posters and presentation slides for internal company use with Canva.'
  ],
  array['NetBeans','HeidiSQL','Canva'],
  3
);

delete from public.projects where true;
insert into public.projects (title, category, year, summary, role, contributions, awards, tech, visual, confidential, featured, sort_order) values
(
  'Project NIISe: National Immigration System', 'System analysis', '2026 – present',
  'Requirements, specification and design documentation for a national immigration system delivered for the Immigration Department of Malaysia.',
  'System Analyst at HeiTech Padu Berhad (analysis, documentation and testing support; not the full system build)',
  array[
    'Authored SRS and SDD documentation to CMMI-aligned standards for client sign-off.',
    'Designed system flows, data flow diagrams, sequence diagrams and wireflows.',
    'Prepared API specifications and request/response structures for integration teams.',
    'Produced Figma wireframes and interactive prototypes before development.',
    'Supported system testing, API testing, defect analysis and UAT.'
  ],
  array[]::text[],
  array['Figma','DFD','Sequence diagrams','API specifications','UAT'],
  'flow', true, true, 1
),
(
  'myIASME Product Management System', 'Web application', '2025',
  'A product management system used to track products, sales performance and stock across four user roles.',
  'Full-Stack Developer (Internship) at IASME Group',
  array[
    'Developed product reporting and add/edit product modules.',
    'Built dashboards computing profit, sales margin, ROI, stock levels, winning DNA insights and product proposals.',
    'Designed and implemented role-based access control for four user roles.',
    'Deployed and maintained the system on GBNetwork hosting.'
  ],
  array[]::text[],
  array[]::text[],
  'dashboard', false, true, 2
),
(
  'Examination Invigilation Timetabling System', 'Final year project', '2025',
  'An automated invigilator scheduling system using a Genetic Algorithm, replacing manual timetabling and reducing assignment effort.',
  'Final year project, Bachelor of Computer Science (UiTM)',
  array[
    'Built automated invigilator scheduling with a Genetic Algorithm.',
    'Modelled constraints such as invigilator availability, subject expertise and exam slots to distribute workload fairly.'
  ],
  array['Best Project Award (COMMAX)', 'Silver Award, 4th Graduate Invention, Innovation & Design Competition (GDIID 2025)'],
  array['Genetic Algorithm'],
  'schedule', false, true, 3
),
(
  'TikTok Sentiment Analysis Web Application', 'Machine learning', '2024',
  'A Flask web application that classifies user reviews as positive, neutral or negative using a trained TF-IDF and classifier pipeline.',
  'Developer',
  array[
    'Engineered a /predict backend route returning JSON predictions with confidence scores for real-time UI updates.',
    'Built a responsive front end with HTML, Tailwind CSS and JavaScript.'
  ],
  array[]::text[],
  array['Python','Flask','TF-IDF','HTML','Tailwind CSS','JavaScript'],
  'chart', false, false, 4
),
(
  'E-Kelas Mengaji Learning Platform', 'Web application', '2023',
  'An online platform connecting Quran students with qualified tutors.',
  'Designer and developer',
  array[
    'Designed and developed the platform.',
    'Implemented secure authentication, session management and class scheduling.'
  ],
  array[]::text[],
  array['PHP','MySQL'],
  'learning', false, false, 5
),
(
  'e-Kenderaan Vehicle Booking System', 'Web application', '2022 – 2023',
  'A vehicle booking project covering booking details, vehicle status and driver assignment, built during an internship at LKPP Corporation.',
  'Web Developer (Internship) at LKPP Corporation',
  array[
    'Developed booking details, vehicle status and driver assignment features.',
    'Redesigned the main user interface for a clearer view of booking and vehicle status.',
    'Produced a six-minute video tutorial to train staff on the system.'
  ],
  array[]::text[],
  array['NetBeans','HeidiSQL'],
  'booking', false, false, 6
);

delete from public.skill_groups where true;
insert into public.skill_groups (name, items, sort_order) values
('System analysis & requirements', array['Requirements gathering','Business process analysis','Gap analysis','Functional specifications','System procedures'], 1),
('Documentation', array['SRS','SDD','CMMI documentation standards'], 2),
('Design & modelling', array['Data Flow Diagrams (DFD)','Sequence diagrams','System flow diagrams','Workflow diagrams','Wireflows','API specifications'], 3),
('UI/UX', array['Figma','Wireframing','Interactive prototyping','User journey mapping'], 4),
('Testing & support', array['System testing','API testing (Postman-style)','Defect analysis','UAT support'], 5),
('Programming & web', array['Python','Java','PHP','JavaScript','HTML','CSS','Flask','Tailwind CSS'], 6),
('Databases', array['Oracle','MySQL','HeidiSQL','phpMyAdmin'], 7),
('Tools & practices', array['VS Code','NetBeans','Jupyter','GitKraken','Agile collaboration'], 8);

delete from public.education where true;
insert into public.education (institution, qualification, field, location, start_date, end_date, grade, details, sort_order) values
(
  'Universiti Teknologi MARA (UiTM), Kampus Kuala Terengganu', 'Bachelor of Computer Science (Hons)', 'Computer Science', 'Kuala Terengganu, Malaysia',
  '2023-03', '2025-06', 'CGPA 3.34',
  array[
    'Final year project: Examination Invigilation Timetabling System (Best Project Award, COMMAX; Silver Award, GDIID 2025)',
    'Coursework includes Software Engineering, Database Engineering, Enterprise Programming, Data Structures, Artificial Intelligence, Computer Security and Image Processing'
  ],
  1
),
(
  'Universiti Teknologi MARA (UiTM), Kampus Raub', 'Diploma in Computer Science', 'Computer Science', 'Raub, Pahang',
  '2020-06', '2023-02', 'CGPA 3.28',
  array[
    'Coursework includes Introduction to Database, Discrete Mathematics and Interactive Multimedia',
    'Practical training: Web Developer intern at LKPP Corporation'
  ],
  2
),
(
  'SMK Seri Panching', 'Sijil Pelajaran Malaysia (SPM)', '', 'Kuantan, Pahang',
  '2015-01', '2019-12', '6A 3B',
  array[]::text[],
  3
);

-- Publish the first version so the public site has content immediately.
insert into public.publications (content, note) values (public._build_snapshot(), 'Initial content from resume');
update public.site_state set last_published_at = now(), last_change_at = now() where id = 1;
