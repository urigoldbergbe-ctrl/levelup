-- ============================================================
-- Global Library Seed — Books, Podcasts, Courses
-- Run this in Supabase SQL Editor after running all migrations
-- Safe to re-run: deletes existing seed data and re-inserts
-- ============================================================

delete from public.global_library;

insert into public.global_library (type, title, author, url, description, platform, gap_tags) values

-- ============================================================
-- BOOKS — Data Science & Analytics
-- ============================================================
('book', 'How to Lie with Statistics', 'Darrell Huff', 'https://www.amazon.com/dp/0393310728', 'A classic primer on how statistics can mislead — essential critical thinking for anyone who works with data or presentations.', 'W. W. Norton', ARRAY['Data Analysis', 'Communication', 'Strategic Thinking']),

('book', 'The Art of Statistics: Learning from Data', 'David Spiegelhalter', 'https://www.amazon.com/dp/1541618513', 'How to think with data. Covers statistical concepts through real-world examples, helping readers draw valid conclusions from numbers.', 'Basic Books', ARRAY['Data Analysis', 'Strategic Thinking']),

('book', 'Data Science for Business', 'Foster Provost & Tom Fawcett', 'https://www.amazon.com/dp/1449361323', 'Applies data science techniques to real business problems. Bridges the gap between technical analysis and strategic decision-making.', 'O''Reilly Media', ARRAY['Data Analysis', 'Strategic Thinking', 'Technical Skills']),

('book', 'Storytelling with Data: A Data Visualization Guide', 'Cole Nussbaumer Knaflic', 'https://www.amazon.com/dp/1119002257', 'How to turn raw data into compelling visual stories. Essential for presenting insights clearly to executives and stakeholders.', 'Wiley', ARRAY['Data Analysis', 'Communication', 'Stakeholder Management']),

('book', 'Python for Data Analysis', 'Wes McKinney', 'https://www.amazon.com/dp/1491957662', 'The definitive guide to data wrangling with Python and pandas, written by the creator of pandas.', 'O''Reilly Media', ARRAY['Data Analysis', 'Technical Skills']),

('book', 'Machine Learning Yearning', 'Andrew Ng', 'https://www.deeplearning.ai/machine-learning-yearning/', 'Practical guidance on how to structure ML projects and develop intuition for diagnosing and fixing machine learning problems.', 'deeplearning.ai', ARRAY['Technical Skills', 'Data Analysis', 'Strategic Thinking']),

('book', 'Deep Learning with Python', 'François Chollet', 'https://www.amazon.com/dp/1617294438', 'A hands-on guide to AI and neural networks using Keras, written by the creator of Keras. Covers foundations of deep learning.', 'Manning Publications', ARRAY['Technical Skills', 'Data Analysis', 'Innovation']),

('book', 'The Signal and the Noise: Why So Many Predictions Fail', 'Nate Silver', 'https://www.amazon.com/dp/0143125087', 'How to distinguish meaningful signals from noise in data. Covers forecasting across politics, sport, economics, and science.', 'Penguin Books', ARRAY['Data Analysis', 'Strategic Thinking', 'Financial Acumen']),

-- ============================================================
-- BOOKS — Business Strategy & Leadership (HBR / Goodreads classics)
-- ============================================================
('book', 'Good to Great: Why Some Companies Make the Leap', 'Jim Collins', 'https://www.amazon.com/dp/0066620996', 'What separates truly great companies from good ones? Collins and his team studied 1,435 companies over 40 years to find out.', 'HarperBusiness', ARRAY['Strategic Thinking', 'Leadership', 'Execution']),

('book', 'Competitive Strategy: Techniques for Analyzing Industries', 'Michael E. Porter', 'https://www.amazon.com/dp/0684841487', 'The foundation of modern strategic thinking. Porter''s Five Forces framework remains the starting point for any competitive analysis.', 'Free Press', ARRAY['Strategic Thinking', 'Financial Acumen', 'Operations']),

('book', 'The Innovator''s Dilemma', 'Clayton M. Christensen', 'https://www.amazon.com/dp/0875845851', 'Why great companies fail when confronted with disruptive innovation, and what leaders can do about it.', 'Harvard Business Review Press', ARRAY['Innovation', 'Strategic Thinking', 'Leadership']),

('book', 'Thinking, Fast and Slow', 'Daniel Kahneman', 'https://www.amazon.com/dp/0374533555', 'A Nobel laureate''s landmark study of the two systems that drive how we think — and the biases that affect every decision.', 'Farrar, Straus and Giroux', ARRAY['Strategic Thinking', 'Leadership', 'Communication']),

('book', 'Zero to One: Notes on Startups, or How to Build the Future', 'Peter Thiel', 'https://www.amazon.com/dp/0804139296', 'The contrarian''s guide to building a great business: how to create something genuinely new rather than copying what already exists.', 'Crown Business', ARRAY['Innovation', 'Strategic Thinking', 'Leadership']),

('book', 'The Hard Thing About Hard Things', 'Ben Horowitz', 'https://www.amazon.com/dp/0062273205', 'There are no shortcuts to leading a company. Horowitz shares the brutal realities of building and running a startup that no one else will tell you.', 'HarperBusiness', ARRAY['Leadership', 'Execution', 'Culture Building']),

('book', 'Leaders Eat Last: Why Some Teams Pull Together', 'Simon Sinek', 'https://www.amazon.com/dp/1591845327', 'Why some leaders sacrifice short-term results for the good of those in their care — and why it pays off. Explores trust and belonging in teams.', 'Portfolio/Penguin', ARRAY['Leadership', 'Culture Building', 'Coaching']),

('book', 'No Rules Rules: Netflix and the Culture of Reinvention', 'Reed Hastings & Erin Meyer', 'https://www.amazon.com/dp/1984877860', 'How Netflix built a culture of radical candour, freedom, and responsibility that allows it to innovate faster than everyone else.', 'Penguin Press', ARRAY['Culture Building', 'Leadership', 'Innovation']),

('book', 'Working Backwards: Insights, Stories, and Secrets from Inside Amazon', 'Colin Bryar & Bill Carr', 'https://www.amazon.com/dp/1250267595', 'The inner workings of Amazon''s leadership principles: how to apply customer-back thinking, single-threaded ownership, and the PR/FAQ process.', 'St. Martin''s Press', ARRAY['Leadership', 'Operations', 'Customer Obsession', 'Innovation']),

('book', 'Shoe Dog: A Memoir by the Creator of Nike', 'Phil Knight', 'https://www.amazon.com/dp/1501135929', 'The raw, candid and riveting memoir of Nike''s founder — a masterclass in resilience, vision, and building a global brand from nothing.', 'Scribner', ARRAY['Leadership', 'Strategic Thinking', 'Execution', 'Marketing']),

('book', 'Creativity, Inc.: Overcoming the Unseen Forces That Stand in the Way of True Inspiration', 'Ed Catmull', 'https://www.amazon.com/dp/0812993012', 'How Pixar built a culture of creativity and how to manage a creative organisation while keeping talent and standards high.', 'Random House', ARRAY['Culture Building', 'Leadership', 'Innovation', 'Coaching']),

('book', 'The Everything Store: Jeff Bezos and the Age of Amazon', 'Brad Stone', 'https://www.amazon.com/dp/0316219266', 'An authoritative account of how Jeff Bezos built Amazon from a garage startup to the world''s most dominant retailer.', 'Little, Brown', ARRAY['Strategic Thinking', 'Customer Obsession', 'Execution', 'Leadership']),

('book', 'Steve Jobs', 'Walter Isaacson', 'https://www.amazon.com/dp/1451648537', 'The definitive biography of Apple''s visionary co-founder, based on exclusive interviews with Jobs and 100 people who knew him.', 'Simon & Schuster', ARRAY['Innovation', 'Leadership', 'Product Management', 'Strategic Thinking']),

('book', 'Measure What Matters: How Google, Bono, and the Gates Foundation Rock the World with OKRs', 'John Doerr', 'https://www.amazon.com/dp/0525536221', 'The OKR framework that transformed Intel and Google and is now used by leading organisations worldwide to set and execute ambitious goals.', 'Portfolio/Penguin', ARRAY['Execution', 'Leadership', 'Operations']),

('book', 'Crossing the Chasm: Marketing and Selling High-Tech Products', 'Geoffrey A. Moore', 'https://www.amazon.com/dp/0062292986', 'The bible for bringing cutting-edge products to progressively larger markets. Essential reading for anyone in product or technology sales.', 'HarperBusiness', ARRAY['Marketing', 'Sales', 'Product Management', 'Strategic Thinking']),

('book', 'High Output Management', 'Andrew S. Grove', 'https://www.amazon.com/dp/0679762884', 'Intel CEO Andy Grove''s timeless handbook for maximising the output of any organisation — packed with frameworks that still define how great managers operate.', 'Vintage', ARRAY['Operations', 'Leadership', 'Execution', 'Coaching']),

('book', 'Influence: The Psychology of Persuasion', 'Robert B. Cialdini', 'https://www.amazon.com/dp/006124189X', 'The six principles of influence that govern human behaviour — used by the world''s best salespeople, marketers, and negotiators.', 'HarperCollins', ARRAY['Sales', 'Marketing', 'Communication', 'Stakeholder Management']),

('book', 'Never Split the Difference: Negotiating As If Your Life Depended On It', 'Chris Voss', 'https://www.amazon.com/dp/0062407805', 'Former FBI hostage negotiator reveals the field-tested tactics he used in high-stakes negotiations — and how to apply them in business.', 'HarperBusiness', ARRAY['Stakeholder Management', 'Communication', 'Sales', 'Leadership']),

-- ============================================================
-- BOOKS — Economist 2025 Business & Strategy picks
-- ============================================================
('book', '1929: The Great Crash and Its Aftermath', 'Andrew Ross Sorkin', 'https://www.amazon.com/dp/0593083865', 'The seminal stockmarket crash of modern history told through the experiences of those who lived through it — hour by hour.', 'Viking', ARRAY['Financial Acumen', 'Strategic Thinking', 'Leadership']),

('book', 'Chokepoints: American Power in the Age of Economic Warfare', 'Edward Fishman', 'https://www.amazon.com/dp/0593443756', 'A riveting tour of how America uses economic sanctions as a weapon, and how they evolved through trial, error, and political pressure.', 'Portfolio', ARRAY['Strategic Thinking', 'Stakeholder Management', 'Financial Acumen']),

('book', 'The Corporation in the 21st Century: Why (Almost) Everything We Are Told About Business Is Wrong', 'John Kay', 'https://www.amazon.com/dp/0300268955', 'One of Britain''s leading economists argues our entire framework for thinking about business and capitalism is hopelessly outdated.', 'Yale University Press', ARRAY['Strategic Thinking', 'Financial Acumen', 'Leadership']),

('book', 'House of Huawei: The Secret History of China''s Most Powerful Company', 'Eva Dou', 'https://www.amazon.com/dp/0593655745', 'The inside story of how Huawei went from basic telephone switches to designing some of the world''s most advanced semiconductors.', 'Portfolio', ARRAY['Strategic Thinking', 'Innovation', 'Technical Skills', 'Leadership']),

('book', 'The Thinking Machine: Jensen Huang, Nvidia and the World''s Most Coveted Microchip', 'Stephen Witt', 'https://www.amazon.com/dp/1984825798', 'The story of Jensen Huang and Nvidia — how one chip company''s decades-long bet on graphics processing unlocked the age of AI.', 'Viking', ARRAY['Innovation', 'Leadership', 'Strategic Thinking', 'Technical Skills']),

('book', 'Empire of AI: Dreams and Nightmares in the Age of Sam Altman', 'Karen Hao', 'https://www.amazon.com/dp/0593654366', 'A revealing portrait of Sam Altman and OpenAI, and the disturbing culture of Silicon Valley that shapes the AI revolution.', 'Penguin Press', ARRAY['Innovation', 'Strategic Thinking', 'Culture Building', 'Technical Skills']),

('book', 'Why Nothing Works: Who Killed Progress — and How to Bring It Back', 'Marc Dunkelman', 'https://www.amazon.com/dp/1541703715', 'How excessive regulation and diffuse power have paralysed progress — and what leaders can do to restore effective execution.', 'PublicAffairs', ARRAY['Leadership', 'Operations', 'Strategic Thinking', 'Execution']),

('book', 'When Everyone Knows That Everyone Knows', 'Steven Pinker', 'https://www.amazon.com/dp/1668078007', 'How common knowledge — knowing that others know something — shapes politics, negotiation, and every social interaction.', 'Scribner', ARRAY['Communication', 'Stakeholder Management', 'Strategic Thinking']),

('book', 'Careless People: A Cautionary Tale of Power, Greed, and Lost Idealism', 'Sarah Wynn-Williams', 'https://www.amazon.com/dp/1250388805', 'A former Facebook executive''s memoir revealing the culture inside Meta — and what happens when growth becomes the only metric that matters.', 'Flatiron Books', ARRAY['Culture Building', 'Leadership', 'Stakeholder Management']),

('book', 'Zbig: The Strategy and Statecraft of Zbigniew Brzezinski', 'Edward Luce', 'https://www.amazon.com/dp/1668032864', 'A compelling biography of America''s most important foreign-policy strategist — a masterclass in long-term thinking and power.', 'Avid Reader Press', ARRAY['Strategic Thinking', 'Leadership', 'Stakeholder Management']),

-- ============================================================
-- PODCASTS
-- ============================================================
('podcast', 'How I Built This with Guy Raz', 'Guy Raz', 'https://www.npr.org/series/490248027/how-i-built-this', 'Innovators, entrepreneurs, and idealists tell the stories behind the movements and companies they built. Essential for founders and aspiring leaders.', 'NPR / Spotify', ARRAY['Leadership', 'Innovation', 'Execution', 'Strategic Thinking']),

('podcast', 'Stuff You Should Know', 'Josh Clark & Charles Bryant', 'https://www.iheart.com/podcast/105-stuff-you-should-know-26940277/', 'Two curious journalists explain how almost everything works — from finance to psychology. Builds the broad intellectual curiosity that great leaders need.', 'iHeart / Spotify', ARRAY['Strategic Thinking', 'Communication', 'Innovation']),

('podcast', 'Business Wars', 'David Brown', 'https://wondery.com/shows/business-wars/', 'The dramatic stories behind the world''s most epic business rivalries — Coke vs Pepsi, Netflix vs Blockbuster, Nike vs Adidas. Strategy in action.', 'Wondery', ARRAY['Strategic Thinking', 'Marketing', 'Execution', 'Customer Obsession']),

('podcast', 'Articles of Interest', 'Avery Trufelman', 'https://articlesofinterest.substack.com/', 'A beautifully produced podcast on the history of clothes. Answers unexpected questions that reveal deep truths about culture, identity, and systems thinking.', 'Spotify / iHeart', ARRAY['Communication', 'Strategic Thinking', 'Culture Building']),

('podcast', 'Final Thoughts: Jerry Springer', 'Novel', 'https://wondery.com/shows/final-thoughts-jerry-springer/', 'Before trash TV, Springer was a Democratic mayor. This series explores the line between public service and entertainment — and what leadership really means.', 'Wondery', ARRAY['Leadership', 'Communication', 'Stakeholder Management']),

('podcast', 'Fela Kuti: Fear No Man', 'Various', 'https://open.spotify.com/show/fela-kuti-fear-no-man', 'The story of Fela Kuti — musician, activist, and pioneer of Afrobeat. A masterclass in creative courage, building a movement, and standing for something.', 'Spotify', ARRAY['Leadership', 'Culture Building', 'Innovation', 'Communication']),

('podcast', 'Flesh and Code', 'Various', 'https://open.spotify.com/show/flesh-and-code', 'A compassionate exploration of people who form relationships with AI companions. Raises profound questions about connection, technology, and the future of work.', 'Spotify', ARRAY['Innovation', 'Technical Skills', 'Stakeholder Management']),

('podcast', 'Heavyweight', 'Jonathan Goldstein', 'https://gimletmedia.com/shows/heavyweight', 'A funny, poignant podcast about life''s unfinished moments — regret, reconciliation, and courage. Builds empathy and self-awareness that great leaders need.', 'Gimlet / Spotify', ARRAY['Coaching', 'Communication', 'Leadership']),

('podcast', 'Missing in the Amazon', 'Various', 'https://open.spotify.com/show/missing-in-the-amazon', 'The investigation into the disappearance of journalist Dom Phillips and activist Bruno Pereira. A story about conviction, risk, and speaking truth to power.', 'Spotify', ARRAY['Leadership', 'Stakeholder Management', 'Communication']),

('podcast', 'Past Present Future: Politics on Trial', 'David Runciman', 'https://open.spotify.com/show/past-present-future', 'Cambridge professor David Runciman explores how political trials — from Joan of Arc to Saddam Hussein — reveal timeless truths about justice and power.', 'Spotify', ARRAY['Strategic Thinking', 'Leadership', 'Communication', 'Stakeholder Management']),

('podcast', 'The Protocol', 'Various', 'https://open.spotify.com/show/the-protocol', 'A documentary series tracing the history of a controversial medical protocol. A deep dive into how institutions make high-stakes decisions under uncertainty.', 'Spotify', ARRAY['Strategic Thinking', 'Stakeholder Management', 'Leadership']),

('podcast', 'Shell Game', 'Evan Ratliff', 'https://open.spotify.com/show/shell-game', 'A journalist establishes a startup run entirely by AI "employees" to investigate how AI will reshape the workforce. The most important career question of our time.', 'Spotify', ARRAY['Innovation', 'Technical Skills', 'Strategic Thinking', 'Operations']),

('podcast', 'The Wargame', 'Various', 'https://open.spotify.com/show/the-wargame', 'Former ministers and generals simulate a crisis response. A masterclass in high-stakes decision-making, scenario planning, and leadership under pressure.', 'Spotify', ARRAY['Strategic Thinking', 'Leadership', 'Execution', 'Stakeholder Management']),

('podcast', 'Masters of Scale', 'Reid Hoffman', 'https://mastersofscale.com/', 'LinkedIn co-founder Reid Hoffman interviews the world''s most successful entrepreneurs about how they scaled their businesses against the odds.', 'Spotify / Apple Podcasts', ARRAY['Leadership', 'Innovation', 'Strategic Thinking', 'Execution']),

('podcast', 'The Tim Ferriss Show', 'Tim Ferriss', 'https://tim.blog/podcast/', 'World-class performers deconstruct their tactics, tools, and routines. Deep-dive conversations with CEOs, athletes, scientists, and artists.', 'Spotify / Apple Podcasts', ARRAY['Leadership', 'Coaching', 'Execution', 'Strategic Thinking']),

('podcast', 'Acquired', 'Ben Gilbert & David Rosenthal', 'https://www.acquired.fm/', 'The complete history of the world''s greatest companies — LVMH, Apple, Nvidia, Amazon. Incredibly detailed strategic analysis told as narrative.', 'Acquired.fm / Spotify', ARRAY['Strategic Thinking', 'Financial Acumen', 'Leadership', 'Innovation']),

('podcast', 'The Knowledge Project', 'Shane Parrish', 'https://fs.blog/knowledge-project/', 'Farnam Street''s Shane Parrish interviews the best in the world to uncover how they think, make decisions, and master their domains.', 'Farnam Street / Spotify', ARRAY['Strategic Thinking', 'Leadership', 'Coaching', 'Data Analysis']),

-- ============================================================
-- COURSES
-- ============================================================
('course', 'The Economist Executive Education — Business & Strategy', NULL, 'https://education.economist.com/online-courses', 'A curated suite of online courses from The Economist covering strategy, leadership, data, and geopolitics. Designed for working executives.', 'The Economist Education', ARRAY['Strategic Thinking', 'Leadership', 'Financial Acumen', 'Operations']),

('course', 'Master Successful Selling', NULL, 'https://www.udemy.com/course/master-successful-selling/', 'A practical sales course covering consultative selling, objection handling, closing techniques, and building long-term client relationships.', 'Udemy', ARRAY['Sales', 'Communication', 'Stakeholder Management']),

('course', 'Cold Email Masterclass', NULL, 'https://www.saleshandy.com/cold-email-masterclass', 'The complete guide to writing cold emails that get replies — frameworks, templates, and sequence strategies used by top sales teams.', 'SalesHandy', ARRAY['Sales', 'Marketing', 'Communication']),

('course', 'How to Build a Winning Pricing Strategy', NULL, 'https://www.udemy.com/course/how-to-build-a-winning-pricing-strategy/', 'Step-by-step frameworks for setting prices that maximise value, win customers, and protect margins — for products and services.', 'Udemy', ARRAY['Financial Acumen', 'Strategic Thinking', 'Marketing']),

('course', 'Data Manipulation with Python (Coursera)', NULL, 'https://www.coursera.org/learn/data-manipulation?specialization=data-science', 'Learn to manipulate, clean, and analyse data using Python and pandas. Part of the IBM Data Science Specialization.', 'Coursera / IBM', ARRAY['Data Analysis', 'Technical Skills']),

('course', 'Google Data Analytics Professional Certificate', NULL, 'https://www.coursera.org/professional-certificates/google-data-analytics', 'Google''s flagship data analytics certificate — covers data cleaning, analysis, visualisation, and SQL. Recognised by employers worldwide.', 'Coursera / Google', ARRAY['Data Analysis', 'Technical Skills', 'Communication']),

('course', 'IBM Data Science Professional Certificate', NULL, 'https://www.coursera.org/professional-certificates/ibm-data-science', 'A comprehensive 10-course program covering Python, SQL, machine learning, and data visualisation. One of the most widely recognised data science credentials.', 'Coursera / IBM', ARRAY['Data Analysis', 'Technical Skills', 'Strategic Thinking']),

('course', 'Google Project Management Professional Certificate', NULL, 'https://www.coursera.org/professional-certificates/google-project-management', 'Google''s end-to-end project management program covering Agile, Scrum, risk management, and stakeholder communication.', 'Coursera / Google', ARRAY['Execution', 'Operations', 'Stakeholder Management']),

('course', 'Successful Negotiation: Essential Strategies and Skills', NULL, 'https://www.coursera.org/learn/negotiation-skills', 'Practical negotiation frameworks from the University of Michigan. Covers planning, bargaining, key tactics, and psychological aspects of deals.', 'Coursera / University of Michigan', ARRAY['Stakeholder Management', 'Communication', 'Sales', 'Leadership']),

('course', 'Project Management Foundations', NULL, 'https://www.coursera.org/learn/project-management-foundations', 'Foundational project management skills: scope, schedule, budget, quality, and communication. Suitable for any function or industry.', 'Coursera', ARRAY['Operations', 'Execution', 'Leadership']),

('course', 'Generative AI for Human Resources', NULL, 'https://www.coursera.org/specializations/generative-ai-for-human-resources', 'How HR professionals can apply generative AI to recruiting, learning & development, employee engagement, and workforce planning.', 'Coursera', ARRAY['Technical Skills', 'Innovation', 'Coaching', 'Operations']),

('course', 'Recruiting, Hiring, and Onboarding Employees', NULL, 'https://www.coursera.org/learn/recruiting-hiring-onboarding-employees', 'Best practices for the full talent acquisition lifecycle — from writing job descriptions to structured interviews and onboarding programmes.', 'Coursera / University of Minnesota', ARRAY['Coaching', 'Culture Building', 'Operations']),

('course', 'Human Resource Management: HR for People Managers', NULL, 'https://www.coursera.org/specializations/human-resource-management', 'A five-course specialisation covering the full HR lifecycle: selection, compensation, performance management, and labour relations.', 'Coursera / University of Minnesota', ARRAY['Coaching', 'Culture Building', 'Leadership', 'Operations']),

('course', 'Financial Markets (Yale / Robert Shiller)', NULL, 'https://www.coursera.org/learn/financial-markets-global', 'Nobel Prize-winning economist Robert Shiller''s overview of financial markets, risk management, and behavioural finance. Free audit available.', 'Coursera / Yale', ARRAY['Financial Acumen', 'Strategic Thinking', 'Data Analysis']),

('course', 'Business Strategy Specialization (University of Virginia)', NULL, 'https://www.coursera.org/specializations/business-strategy', 'Develops the skills to create, analyse, and execute business strategies. Covers competitive advantage, innovation strategy, and growth.', 'Coursera / Darden School of Business', ARRAY['Strategic Thinking', 'Leadership', 'Financial Acumen']),

('course', 'Digital Marketing Specialization (University of Illinois)', NULL, 'https://www.coursera.org/specializations/digital-marketing', 'Covers digital marketing analytics, SEO, social media, and 3D printing. One of Coursera''s most popular marketing programmes.', 'Coursera / University of Illinois', ARRAY['Marketing', 'Data Analysis', 'Customer Obsession']);
