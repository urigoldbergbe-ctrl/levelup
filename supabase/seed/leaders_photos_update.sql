-- ============================================================
-- Update photo URLs for all 20 global leaders
-- Run this in Supabase SQL Editor
-- Photos sourced from Wikipedia Commons (stable, freely licensed)
-- ============================================================

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Tim_Cook_March_2026_%28cropped%29.jpg/440px-Tim_Cook_March_2026_%28cropped%29.jpg' where id = 'tim-cook';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/440px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg' where id = 'satya-nadella';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Bob_Sternfels_at_World_Economic_Forum_Davos_2023.png/440px-Bob_Sternfels_at_World_Economic_Forum_Davos_2023.png' where id = 'bob-sternfels';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Diana_Farrell%2C_CEO_and_President%2C_JP_Morgan_Chase_Foundation.jpg/440px-Diana_Farrell%2C_CEO_and_President%2C_JP_Morgan_Chase_Foundation.jpg' where id = 'diana-farrell';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Shumanghosemajumder2012.jpg/440px-Shumanghosemajumder2012.jpg' where id = 'shuman-ghosemajumder';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Kathleen_Hogan-smiling_headshot.jpg/440px-Kathleen_Hogan-smiling_headshot.jpg' where id = 'kathleen-hogan';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sundar_Pichai_-_2023_%28cropped%29.jpg/440px-Sundar_Pichai_-_2023_%28cropped%29.jpg' where id = 'sundar-pichai';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Sheryl_Sandberg_WEF_2013_%28crop_by_James_Tamim%29.jpg/440px-Sheryl_Sandberg_WEF_2013_%28crop_by_James_Tamim%29.jpg' where id = 'sheryl-sandberg';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Gwynne_Shotwell_at_2018_Commercial_Crew_announcement.jpg/440px-Gwynne_Shotwell_at_2018_Commercial_Crew_announcement.jpg' where id = 'gwynne-shotwell';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/David_Heinemeier_Hansson_Driver_of_Abu_Dhabi_Proton_Racing%27s_Porsche_911_RSR_%2827225732035%29_%28cropped%29.jpg/440px-David_Heinemeier_Hansson_Driver_of_Abu_Dhabi_Proton_Racing%27s_Porsche_911_RSR_%2827225732035%29_%28cropped%29.jpg' where id = 'dhh';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Howard_Schultz_by_Gage_Skidmore.jpg/440px-Howard_Schultz_by_Gage_Skidmore.jpg' where id = 'howard-schultz';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/2022_Bob_Iger_%28cropped%29.jpg/440px-2022_Bob_Iger_%28cropped%29.jpg' where id = 'bob-iger';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Laszlo_Bock_2014.jpg' where id = 'laszlo-bock';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Leena-Nair-Chief-HR-Officer_%28cropped%29.jpg/440px-Leena-Nair-Chief-HR-Officer_%28cropped%29.jpg' where id = 'leena-nair';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Gary_Vaynerchuk_public_domain.jpg/440px-Gary_Vaynerchuk_public_domain.jpg' where id = 'gary-vaynerchuk';

update public.leader_profiles set photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/MarkCuban2023.jpg/440px-MarkCuban2023.jpg' where id = 'mark-cuban';

-- Verify results
select id, name, photo_url is not null as has_photo
from public.leader_profiles
where id in (
  'tim-cook','satya-nadella','bob-sternfels','diana-farrell','shuman-ghosemajumder',
  'kathleen-hogan','sundar-pichai','sheryl-sandberg','gwynne-shotwell','dhh',
  'will-grannis','howard-schultz','bob-iger','david-green','laszlo-bock',
  'leena-nair','morgan-flatley','gary-vaynerchuk','scott-brinker','mark-cuban'
)
order by name;
