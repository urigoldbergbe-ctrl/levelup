-- ============================================================
-- Global Leaders Seed — 20 leaders
-- Safe to re-run: uses INSERT ... ON CONFLICT DO UPDATE
-- Run AFTER all migrations (especially 00010 bio, 00011 categories)
-- ============================================================

insert into public.leader_profiles (
  id, name, title, company, category, category2, category3,
  bio, photo_url, g1, g2,
  skills, career_ladder, leader_skill_scores,
  approved, is_custom, org_id
)
values

-- ── 1. TIM COOK ───────────────────────────────────────────────
(
  'tim-cook',
  'Tim Cook',
  'CEO',
  'Apple',
  'Operations',
  'Strategy',
  null,
  'Tim Cook joined Apple in 1998 and became CEO in 2011 following Steve Jobs''s resignation. Known for transforming Apple''s supply chain into one of the most efficient in the world, he expanded Apple''s services revenue and market cap to record highs while steering the company through global supply disruptions and geopolitical challenges.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Tim_Cook_March_2026_%28cropped%29.jpg/440px-Tim_Cook_March_2026_%28cropped%29.jpg',
  '#0a1628', '#1e3a5f',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 2. SATYA NADELLA ──────────────────────────────────────────
(
  'satya-nadella',
  'Satya Nadella',
  'Chairman & CEO',
  'Microsoft',
  'Strategy',
  'Engineering',
  null,
  'Satya Nadella became CEO of Microsoft in 2014 after 22 years at the company. He led a fundamental cultural and strategic transformation — moving Microsoft to a cloud-first, growth-mindset culture, acquiring LinkedIn and GitHub, and turning Azure into a top-tier cloud platform. Under his leadership, Microsoft''s market cap grew from ~$300B to over $3 trillion.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/440px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg',
  '#0d1a2e', '#1a3050',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 3. BOB STERNFELS ──────────────────────────────────────────
(
  'bob-sternfels',
  'Bob Sternfels',
  'Global Managing Partner',
  'McKinsey & Company',
  'Strategy',
  'Operations',
  null,
  'Bob Sternfels became McKinsey''s Global Managing Partner in 2021. He has guided the firm through significant scrutiny and reform, including restructuring governance and accountability practices. He has spent most of his career advising clients in the technology and private equity sectors and is a strong advocate for linking organisational transformation to performance outcomes.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Bob_Sternfels_at_World_Economic_Forum_Davos_2023.png/440px-Bob_Sternfels_at_World_Economic_Forum_Davos_2023.png',
  '#1a1a2e', '#2d2060',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 4. DIANA FARRELL ──────────────────────────────────────────
(
  'diana-farrell',
  'Diana Farrell',
  'President & CEO',
  'JPMorgan Chase Institute',
  'Strategy',
  'Data',
  null,
  'Diana Farrell is a prominent economist and policy leader who helped shape U.S. economic policy under President Obama. She spent nearly two decades at McKinsey''s Global Institute before joining JPMorgan Chase, where she leads a think tank generating data-driven insights on the real economy. She is known for bridging academic research, public policy, and private sector strategy.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Diana_Farrell%2C_CEO_and_President%2C_JP_Morgan_Chase_Foundation.jpg/440px-Diana_Farrell%2C_CEO_and_President%2C_JP_Morgan_Chase_Foundation.jpg',
  '#0a1a28', '#163050',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 5. SHUMAN GHOSEMAJUMDER ───────────────────────────────────
(
  'shuman-ghosemajumder',
  'Shuman Ghosemajumder',
  'Global Head of AI',
  'Human Security',
  'Engineering',
  'Product',
  null,
  'Shuman Ghosemajumder is one of the world''s foremost experts on AI-powered fraud and bot mitigation. He coined the term "synthetic identity fraud" and built foundational ad fraud prevention systems at Google before joining Shape Security (acquired by F5) as CTO. He is a frequent speaker and writer on the intersection of AI, security, and product integrity.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Shumanghosemajumder2012.jpg/440px-Shumanghosemajumder2012.jpg',
  '#0a1f0a', '#0d2b1a',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 6. KATHLEEN HOGAN ─────────────────────────────────────────
(
  'kathleen-hogan',
  'Kathleen Hogan',
  'Chief People Officer & EVP, Human Resources',
  'Microsoft',
  'HR',
  'Strategy',
  null,
  'Kathleen Hogan has been Microsoft''s CPO since 2015 and is widely credited — alongside Satya Nadella — for reshaping Microsoft''s culture around growth mindset principles. She oversees 220,000+ employees globally and has championed inclusive hiring, employee well-being, and leadership development as strategic levers. She previously led Microsoft''s global customer success organisation.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Kathleen_Hogan-smiling_headshot.jpg/440px-Kathleen_Hogan-smiling_headshot.jpg',
  '#2a0f1a', '#3d1a2e',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 7. SUNDAR PICHAI ──────────────────────────────────────────
(
  'sundar-pichai',
  'Sundar Pichai',
  'CEO',
  'Alphabet & Google',
  'Strategy',
  'Product',
  null,
  'Sundar Pichai joined Google in 2004 and rose through product leadership roles before becoming Google CEO in 2015 and Alphabet CEO in 2019. He has led Google through the AI era, overseeing the launch of Gemini and the integration of AI across Google''s product portfolio. Known for his calm, consensus-driven leadership style and deep product intuition.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sundar_Pichai_-_2023_%28cropped%29.jpg/440px-Sundar_Pichai_-_2023_%28cropped%29.jpg',
  '#0d1a28', '#1a2d50',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 8. SHERYL SANDBERG ────────────────────────────────────────
(
  'sheryl-sandberg',
  'Sheryl Sandberg',
  'Founder',
  'Lean In Foundation',
  'Operations',
  'Marketing',
  null,
  'Sheryl Sandberg served as Facebook''s COO from 2008 to 2022, building the advertising engine that turned Facebook into a $100B+ revenue business. Before Facebook she was VP of Global Online Sales at Google. She authored the bestselling book Lean In, sparking a global conversation on women in leadership. She stepped down from Meta in 2022 to focus on philanthropy.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Sheryl_Sandberg_WEF_2013_%28crop_by_James_Tamim%29.jpg/440px-Sheryl_Sandberg_WEF_2013_%28crop_by_James_Tamim%29.jpg',
  '#1a0a28', '#2d1a40',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 9. GWYNNE SHOTWELL ────────────────────────────────────────
(
  'gwynne-shotwell',
  'Gwynne Shotwell',
  'President & COO',
  'SpaceX',
  'Operations',
  'Strategy',
  null,
  'Gwynne Shotwell has been SpaceX''s President and COO since 2008, managing all day-to-day operations and customer relationships while Elon Musk focuses on design and innovation. She is widely regarded as the executive who turned SpaceX from an audacious startup into a commercially dominant space company, securing landmark contracts with NASA and the DoD and scaling Starlink globally.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Gwynne_Shotwell_at_2018_Commercial_Crew_announcement.jpg/440px-Gwynne_Shotwell_at_2018_Commercial_Crew_announcement.jpg',
  '#0a0d1f', '#101a3a',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 10. DAVID HEINEMEIER HANSSON (DHH) ───────────────────────
(
  'dhh',
  'David Heinemeier Hansson',
  'Co-Founder & CTO',
  '37signals',
  'Engineering',
  'Product',
  null,
  'DHH created Ruby on Rails in 2004 — a web framework that defined a generation of internet products and startups. As CTO and co-founder of 37signals, he has been a vocal contrarian on VC culture, remote work, growth-at-all-costs, and SaaS pricing. He co-authored Rework and Remote with Jason Fried and is one of the most influential independent voices in software and business philosophy.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/David_Heinemeier_Hansson_Driver_of_Abu_Dhabi_Proton_Racing%27s_Porsche_911_RSR_%2827225732035%29_%28cropped%29.jpg/440px-David_Heinemeier_Hansson_Driver_of_Abu_Dhabi_Proton_Racing%27s_Porsche_911_RSR_%2827225732035%29_%28cropped%29.jpg',
  '#0a1a0a', '#163016',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 11. WILL GRANNIS ──────────────────────────────────────────
(
  'will-grannis',
  'Will Grannis',
  'Managing Director, Office of the CTO',
  'Google Cloud',
  'Engineering',
  'Strategy',
  null,
  'Will Grannis leads Google Cloud''s Office of the CTO, working directly with enterprise and government customers on their most complex technical challenges. A former U.S. Army officer and intelligence community technology leader, he bridges deep technical expertise with strategic advisory work, helping organisations understand and apply emerging technologies at scale.',
  null,
  '#0a1a10', '#102a1a',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 12. HOWARD SCHULTZ ────────────────────────────────────────
(
  'howard-schultz',
  'Howard Schultz',
  'Former CEO & Executive Chairman',
  'Starbucks',
  'Strategy',
  'Operations',
  null,
  'Howard Schultz joined Starbucks in 1982 and transformed it from a small Seattle coffee retailer into a global brand with 35,000+ locations. He served as CEO twice (1986–2000, 2008–2017) and returned as Interim CEO in 2022. Schultz is credited with pioneering the "third place" concept and making employee benefits such as healthcare and stock options central to Starbucks''s operating model.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Howard_Schultz_by_Gage_Skidmore.jpg/440px-Howard_Schultz_by_Gage_Skidmore.jpg',
  '#1a0f00', '#2d1a00',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 13. BOB IGER ──────────────────────────────────────────────
(
  'bob-iger',
  'Bob Iger',
  'CEO',
  'The Walt Disney Company',
  'Strategy',
  'Operations',
  null,
  'Bob Iger served as Disney''s CEO from 2005 to 2020, overseeing landmark acquisitions of Pixar, Marvel, Lucasfilm, and 21st Century Fox, and launching Disney+. He returned as CEO in late 2022 to stabilise the company after a turbulent period, focusing on streaming profitability, cost restructuring, and content strategy. He is widely considered one of the greatest dealmakers in media history.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/2022_Bob_Iger_%28cropped%29.jpg/440px-2022_Bob_Iger_%28cropped%29.jpg',
  '#1a0a00', '#2d1a0a',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 14. DAVID GREEN ───────────────────────────────────────────
(
  'david-green',
  'David Green',
  'Executive Director',
  'Insight222',
  'HR',
  'Data',
  null,
  'David Green is one of the world''s leading practitioners and thought leaders in people analytics. He spent years at IBM building enterprise-grade people data capabilities before becoming a consultant and researcher focused on how organisations can use data to make better talent decisions. His podcast and writing have shaped how HR leaders globally think about analytics, workforce planning, and evidence-based management.',
  null,
  '#1a0a2e', '#2a1545',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 15. LASZLO BOCK ───────────────────────────────────────────
(
  'laszlo-bock',
  'Laszlo Bock',
  'Co-Founder & CEO',
  'Sapia.ai',
  'HR',
  'Strategy',
  null,
  'Laszlo Bock led People Operations at Google from 2006 to 2016, scaling the team from 6,000 to 60,000 employees and building what many consider the most data-driven and innovative HR function in the world. He authored Work Rules!, a landmark book on people management. He later co-founded Humu (acquired) and now leads Sapia.ai, an AI-powered hiring platform.',
  'https://upload.wikimedia.org/wikipedia/commons/e/ea/Laszlo_Bock_2014.jpg',
  '#2a0f1a', '#3d1a2e',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 16. LEENA NAIR ────────────────────────────────────────────
(
  'leena-nair',
  'Leena Nair',
  'Global CEO',
  'Chanel',
  'HR',
  'Strategy',
  null,
  'Leena Nair made history in 2022 when she was appointed CEO of Chanel, becoming one of the few HR executives to make the leap to top CEO of a global luxury brand. During her 30 years at Unilever she championed purpose-led business, diversity, and sustainable growth, rising to CHRO before the surprise Chanel appointment. She is widely seen as a model for how people-focused leaders can ascend to the highest levels of business.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Leena-Nair-Chief-HR-Officer_%28cropped%29.jpg/440px-Leena-Nair-Chief-HR-Officer_%28cropped%29.jpg',
  '#1a0a1a', '#2e1530',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 17. MORGAN FLATLEY ────────────────────────────────────────
(
  'morgan-flatley',
  'Morgan Flatley',
  'Global CMO & EVP, New Business Ventures',
  'McDonald''s',
  'Marketing',
  'Strategy',
  null,
  'Morgan Flatley oversees global marketing strategy for one of the world''s most recognised brands, having previously led the highly successful "Famous Orders" campaign and McDonald''s partnership with BTS. She has spearheaded McDonald''s cultural relevance strategy — embedding the brand in music, sports, and pop culture — and now also leads new business development, reflecting marketing''s expansion into growth strategy at McDonald''s.',
  null,
  '#1a0800', '#2d1200',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 18. GARY VAYNERCHUK ───────────────────────────────────────
(
  'gary-vaynerchuk',
  'Gary Vaynerchuk',
  'Chairman & CEO',
  'VaynerX / VaynerMedia',
  'Marketing',
  'Strategy',
  null,
  'Gary Vaynerchuk built Wine Library TV into one of the internet''s first viral video series before founding VaynerMedia in 2009, now one of the largest independent social media agencies in the world. A prolific content creator and investor (early bets on Twitter, Tumblr, Uber, Snapchat), he is one of the most influential voices on digital marketing, personal branding, and entrepreneurship, known for his high-energy, social-native philosophy on attention and brand building.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Gary_Vaynerchuk_public_domain.jpg/440px-Gary_Vaynerchuk_public_domain.jpg',
  '#1a0500', '#2d0d00',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 19. SCOTT BRINKER ─────────────────────────────────────────
(
  'scott-brinker',
  'Scott Brinker',
  'VP Platform Ecosystem',
  'HubSpot',
  'Marketing',
  'Product',
  null,
  'Scott Brinker is the definitive authority on marketing technology — his annual "MarTech Landscape" supergraphic has tracked the explosion of the martech industry from ~150 vendors in 2011 to over 14,000 today. As VP Platform Ecosystem at HubSpot, he shapes how partners and developers build on HubSpot''s platform. He bridges the worlds of marketing strategy, product thinking, and technology architecture in a way few others do.',
  null,
  '#0d1a10', '#1a2e1a',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
),

-- ── 20. MARK CUBAN ────────────────────────────────────────────
(
  'mark-cuban',
  'Mark Cuban',
  'Co-Owner',
  'Cost Plus Drugs',
  'Strategy',
  'Operations',
  null,
  'Mark Cuban made his fortune selling Broadcast.com to Yahoo in 1999 for $5.7B. He then bought the Dallas Mavericks and won an NBA championship in 2011. Known for his appearances on Shark Tank, he has invested in hundreds of startups. Most recently, he launched Cost Plus Drugs, a transparent-pricing online pharmacy disrupting pharmaceutical pricing in the U.S., which has become one of his most praised and impactful ventures.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/MarkCuban2023.jpg/440px-MarkCuban2023.jpg',
  '#0d1a28', '#1a2a40',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  true, false, null
)

on conflict (id) do update set
  name               = excluded.name,
  title              = excluded.title,
  company            = excluded.company,
  category           = excluded.category,
  category2          = excluded.category2,
  category3          = excluded.category3,
  bio                = excluded.bio,
  photo_url          = excluded.photo_url,
  g1                 = excluded.g1,
  g2                 = excluded.g2,
  approved           = excluded.approved,
  is_custom          = excluded.is_custom,
  org_id             = excluded.org_id;
