-- ============================================================
-- Supabase Trends Table + Seed Data
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create trends table
CREATE TABLE IF NOT EXISTS trends (
    id          uuid primary key default gen_random_uuid(),
    title       text not null,
    platform    text not null check (platform in ('Instagram', 'TikTok', 'Facebook', 'X', 'LinkedIn', 'YouTube Shorts')),
    niche       text not null,
    hashtags    text[] default '{}',
    level       text not null default 'rising' check (level in ('high', 'rising', 'emerging')),
    description text,
    content_ideas text[] default '{}',
    estimated_reach bigint default 0,
    created_at  timestamptz default now(),
    updated_at  timestamptz default now(),
    is_active   boolean default true
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_trends_platform ON trends(platform);
CREATE INDEX IF NOT EXISTS idx_trends_niche ON trends(niche);
CREATE INDEX IF NOT EXISTS idx_trends_level ON trends(level);
CREATE INDEX IF NOT EXISTS idx_trends_active ON trends(is_active);

-- 3. RLS Policies
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read trends" ON trends;
CREATE POLICY "Public read trends"
    ON trends FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Service role manage trends" ON trends;
CREATE POLICY "Service role manage trends"
    ON trends FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Seed curated real trend data
DELETE FROM trends;

INSERT INTO trends (title, platform, niche, hashtags, level, description, content_ideas, estimated_reach) VALUES
('POV: skincare routine yang bikin glowing dalam 7 hari', 'TikTok', 'Beauty & Skincare', ARRAY['#glowup', '#skincareroutine', '#cleanbeauty', '#7daysglow'], 'high', 'Format POV (Point of View) untuk menunjukkan transformasi kulit dalam 7 hari menggunakan produk tertentu. Sangat viral karena relatable dan visual before-after yang dramatis.', ARRAY['Buat video Day 1 vs Day 7 split screen', 'Gunakan transisi smooth antar hari', 'Tambahkan text overlay detail produk'], 2500000),

('AI tools yang bikin kerjaan 5 jam jadi 30 menit', 'LinkedIn', 'Tech & Gadget', ARRAY['#AItools', '#productivity', '#futureofwork', '#artificialintelligence'], 'high', 'Thread atau carousel yang menunjukkan perbandingan workflow manual vs AI. Format ini selalu perform because everyone wants to work smarter.', ARRAY['Carousel: 5 AI tools yang belum banyak orang tahu', 'Video demo real-time comparison', 'Template prompt yang bisa langsung dipakai'], 800000),

('Hook copywriting yang convert: before vs after framework', 'Instagram', 'Marketing & Branding', ARRAY['#copywriting', '#marketingtips', '#contentcreator', '#hook'], 'rising', 'Breakdown hook writing technique dengan format before-after. Audience langsung lihat value dari improvement yang dilakukan.', ARRAY['Carousel 5 slides dengan 3 contoh hook', 'Reels: rewrite caption followers secara live', 'Template hook yang bisa di-copy paste'], 500000),

('Cara jualan tanpa hard-sell: storytelling approach', 'TikTok', 'Sales & E-commerce', ARRAY['#jualanonline', '#storytelling', '#softselltips', '#bisnisonline'], 'high', 'Teach sellers untuk cerita dulu, jualan kemudian. Format storytime 60 detik yang build emotional connection sebelum CTA.', ARRAY['Cerita customer journey yang emosional', 'BTS packing order sambil cerita', 'Testimoni dalam format cerita bukan review'], 3200000),

('Resep 15 menit yang aesthetic buat content', 'Instagram', 'Food & Lifestyle', ARRAY['#foodcontent', '#aesthetic', '#quickrecipe', '#masakcepat'], 'rising', 'Quick recipe content dengan aesthetic plating. Kunci: overhead shot, natural light, dan satisfying process shots.', ARRAY['Reels: 15 second cooking montage', 'Carousel: step-by-step dengan flat lay', 'Before/after:食材 mentah vs hasil akhir'], 1200000),

('Morning routine founder yang produktif tanpa hustle culture', 'YouTube Shorts', 'Health & Fitness', ARRAY['#morningroutine', '#founderslife', '#wellness', '#productivity'], 'emerging', 'Authentic morning routine yang emphasize work-life balance, bukan toxic productivity. Resonate dengan Gen-Z dan millennial founders.', ARRAY['Vlog style: wake up to first deep work session', 'ASMR morning routine tanpa talking', 'What I eat in a day sebagai founder'], 400000),

('Micro-course format: teach one thing in 60 seconds', 'TikTok', 'Education', ARRAY['#learnontiktok', '#microcourse', '#edutok', '#60secondlessons'], 'high', 'Edu-tainment format yang deliver satu concept dalam exactly 60 detik. Pacing cepat, visual aids, dan clear takeaway.', ARRAY['Green screen: explain concept dengan visual di belakang', 'Whiteboard animation style', 'Quiz format: guess the answer'], 5000000),

('Budgeting challenge: 30 hari tanpa impulse buying', 'Facebook', 'Finance', ARRAY['#budgetingchallenge', '#financetips', '#savingmoney', '#30daychallenge'], 'rising', 'Community challenge format yang ajak audience track spending selama 30 hari. High engagement karena interactive dan relatable.', ARRAY['Daily check-in posts dengan progress tracker', 'Weekly financial tips carousel', 'Before/after savings reveal'], 350000),

('Dewy makeup look dengan produk lokal under 100k', 'TikTok', 'Beauty & Skincare', ARRAY['#dewymakeup', '#produklokal', '#makeupmurah', '#beautytips'], 'rising', 'Affordable beauty content yang highlight local brands. Format get ready with me (GRWM) dengan honest review.', ARRAY['GRWM video dengan price breakdown', 'Comparison: local vs international product', 'Haul video: semua produk under 100k'], 1800000),

('SaaS demo video format yang bikin orang stay sampai akhir', 'LinkedIn', 'Tech & Gadget', ARRAY['#SaaS', '#productdemo', '#B2Bmarketing', '#productled'], 'emerging', 'Breakdown teknik demo SaaS yang engaging. Use pattern interrupts, quick wins, dan clear CTA. Anti-boring demo format.', ARRAY['Screen recording dengan face cam overlay', 'Problem → Solution format 90 detik', 'Customer testimonial integration'], 150000),

('Carousel format: 5 slides yang educate + convert', 'Instagram', 'Marketing & Branding', ARRAY['#carouseltips', '#instagramgrowth', '#contentmarketing', '#carousel'], 'high', 'Template carousel yang proven convert. Slide 1: hook, Slide 2-3: value, Slide 4: proof, Slide 5: CTA.', ARRAY['Share actual carousel template', 'Case study: carousel yang get 1000 saves', 'Common carousel mistakes to avoid'], 900000),

('Live selling strategy: flash sale + countdown timer', 'Facebook', 'Sales & E-commerce', ARRAY['#liveselling', '#flashsale', '#ecommercetips', '#livestreaming'], 'rising', 'Breakdown live selling technique menggunakan scarcity dan urgency. Timer + limited stock create FOMO.', ARRAY['Setup OBS untuk live selling', 'Script template untuk host', 'Behind the scenes of viral live selling'], 600000),

('Desk setup minimalis untuk WFH productivity', 'YouTube Shorts', 'Tech & Gadget', ARRAY['#desksetup', '#minimalist', '#WFH', '#productivitysetup'], 'emerging', 'Aesthetic desk tour format. Satisfying organization shots dengan product recommendations. High save rate.', ARRAY['Cinematic desk tour 60 detik', 'Before/after desk makeover', 'Budget breakdown semua items'], 700000),

('Thread format: breakdown strategi growth dari 0 ke 10k followers', 'X', 'Marketing & Branding', ARRAY['#growthstrategy', '#threadtips', '#socialmedia', '#buildinpublic'], 'high', 'Long-form Twitter/X thread yang share personal journey atau case study. High bookmark dan retweet rate.', ARRAY['15-tweet thread dengan hook kuat', 'Data-driven insights dengan screenshot', 'Engage replies untuk boost algorithm'], 250000),

('Meal prep sehat untuk seminggu dalam 2 jam', 'Instagram', 'Food & Lifestyle', ARRAY['#mealprep', '#healthyfood', '#contentideas', '#mealplanning'], 'emerging', 'Practical meal prep content yang show real process. Not Instagram-perfect, tapi achievable dan helpful.', ARRAY['Time-lapse 2 jam cooking session', 'Storage container organization hack', 'Cost per meal breakdown'], 950000),

('Behind the brand: story di balik produk viral', 'TikTok', 'Marketing & Branding', ARRAY['#behindthebrand', '#brandstory', '#founderstory', '#viralproduct'], 'high', 'Authentic founder storytelling yang humanize brand. Share struggles, failures, dan breakthrough moments.', ARRAY['Day in my life sebagai founder', 'Pack orders sambil cerita origin story', 'How we pivoted dari failure ke success'], 4000000),

('ASMR unboxing: first impression yang satisfying', 'YouTube Shorts', 'Tech & Gadget', ARRAY['#ASMR', '#unboxing', '#firstimpression', '#satisfying'], 'rising', 'Satisfying unboxing tanpa talking. Focus pada sound design, close-up shots, dan genuine first reaction.', ARRAY['Close-up unboxing dengan good mic', 'Multiple angle product reveal', 'ASMR + quick review hybrid'], 1500000),

('Outfit of the day: mix high-end + thrift', 'Instagram', 'Beauty & Skincare', ARRAY['#OOTD', '#thriftflip', '#sustainablefashion', '#outfitinspo'], 'rising', 'Fashion content yang combine affordable thrifting dengan statement pieces. Sustainability angle resonates kuat.', ARRAY['Get ready with me format', 'Thrift haul + styling tips', 'One item three ways'], 800000),

('Quick Excel tips yang bikin bos impressed', 'LinkedIn', 'Education', ARRAY['#ExcelTips', '#productivity', '#careeradvice', '#corporatetips'], 'high', 'Quick Excel/Google Sheets tips yang immediately useful. Screen recording format 30-60 detik.', ARRAY['Formula yang jarang orang tahu', 'Automation trick untuk repetitive tasks', 'Dashboard building time-lapse'], 1200000),

('Room tour: small apartment makeover under 5 juta', 'TikTok', 'Food & Lifestyle', ARRAY['#roomtour', '#apartmentmakeover', '#smallspaces', '#budgetdecor'], 'high', 'Home makeover content dengan budget constraint. Before-after transformation yang dramatic dan achievable.', ARRAY['Time-lapse makeover process', 'Item breakdown dengan harga', 'Space-saving hacks tour'], 3500000);

-- 5. Update timestamps
UPDATE trends SET created_at = NOW() - (random() * INTERVAL '30 days'), updated_at = NOW();
