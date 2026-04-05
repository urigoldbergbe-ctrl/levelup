-- LevelUp seed data — run after migrations
-- Inserts the curated leader catalog (populated as leaders are confirmed)

insert into public.leader_profiles (id, name, title, company, category, quote, g1, g2, own_book, skills, career_ladder, approved)
values (
  'bezos',
  'Jeff Bezos',
  'Founder & Executive Chairman',
  'Amazon',
  'Strategy',
  'We are stubborn on vision. We are flexible on details.',
  '#1a1a2e',
  '#16213e',
  '{"title":"Invent and Wander","url":"https://amazon.com/dp/1647820715?tag=levelup-20","why":"Bezos''s collected writings and speeches — the closest thing to his mental model in one place."}',
  '["Long-Term Thinking","Customer Obsession","Operational Excellence","Invention & Innovation","Capital Allocation"]',
  '[{"title":"Product Manager II","co":"Amazon","years":"Y0–Y2","yoe":"3–5 years exp","description":"Own end-to-end delivery of a single product area. Write PRFAQs, define success metrics, and work directly with engineering to ship.","qualifications":["Bachelor''s in Business, CS, or Engineering","Experience writing product specs and requirements","Demonstrated ability to influence without authority","Comfort with data — SQL or analytics tooling"]},{"title":"Senior Product Manager","co":"Amazon","years":"Y2–Y4","yoe":"5–8 years exp","description":"Lead a product family with multiple workstreams. Drive cross-functional alignment across engineering, design, and legal.","qualifications":["Track record of launching products with measurable business impact","Experience managing indirect reports or contract teams","Proficiency with financial modelling","MBA preferred but not required"]},{"title":"Principal Product Manager – Technical","co":"Amazon","years":"Y4–Y7","yoe":"8–12 years exp","description":"Set the three-year vision for a large product domain. Operate as a peer to VP Engineering.","qualifications":["Proven record of building 0→1 products at scale","Deep technical fluency","Experience hiring and developing senior talent","Demonstrated strategic influence at the Director level"]},{"title":"Vice President, Product","co":"Amazon","years":"Y7–Y10","yoe":"12+ years exp","description":"Own Amazon''s strategy for a multi-billion dollar category. Present annually to the S-team.","qualifications":["P&L ownership of a business >$500M revenue","Track record of developing Principal and Director-level leaders","Ability to articulate 5-year strategy in a six-page narrative","Demonstrated pattern of raising the hiring bar"]}]',
  true
);
