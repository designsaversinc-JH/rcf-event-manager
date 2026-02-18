-- Legacy schema cleanup:
-- If prior versions created integer-based ids, drop conflicting tables so the
-- current text-id schema can be applied cleanly.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'id'
      AND data_type IN ('smallint', 'integer', 'bigint')
  ) THEN
    DROP TABLE IF EXISTS post_categories CASCADE;
    DROP TABLE IF EXISTS posts CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tags'
      AND column_name = 'id'
      AND data_type IN ('smallint', 'integer', 'bigint')
  ) THEN
    DROP TABLE IF EXISTS blog_tags CASCADE;
    DROP TABLE IF EXISTS tags CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'blogs'
      AND column_name = 'id'
      AND data_type IN ('smallint', 'integer', 'bigint')
  ) THEN
    DROP TABLE IF EXISTS blog_tags CASCADE;
    DROP TABLE IF EXISTS blogs CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  firebase_uid TEXT UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  publish_date TIMESTAMPTZ,
  author TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
  category TEXT,
  cover_img TEXT,
  blog_url TEXT UNIQUE,
  summary TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blog_type TEXT NOT NULL DEFAULT 'written' CHECK (blog_type IN ('written', 'video')),
  vlog_content TEXT,
  vlog_embed TEXT,
  vlog_url TEXT
);

ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'blogs'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%status%'
  LIMIT 1;

  IF constraint_name IS NOT NULL AND constraint_name <> 'blogs_status_check' THEN
    EXECUTE format('ALTER TABLE blogs DROP CONSTRAINT %I', constraint_name);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'blogs'::regclass AND conname = 'blogs_status_check'
  ) THEN
    ALTER TABLE blogs
      ADD CONSTRAINT blogs_status_check
      CHECK (status IN ('draft', 'pending_review', 'published', 'archived'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS blog_tags (
  blog_id TEXT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT,
  department TEXT,
  summary TEXT,
  apply_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  publish_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS navigation_items (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  position INTEGER NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  site_title TEXT NOT NULL DEFAULT 'Envision Wealth Planning',
  hero_title TEXT NOT NULL DEFAULT 'Align Your Investments & Retirement Plans With What Matters to You.',
  hero_subtitle TEXT NOT NULL DEFAULT 'Strategic guidance and practical insight for families and businesses.',
  primary_cta_label TEXT NOT NULL DEFAULT 'For Myself',
  primary_cta_href TEXT NOT NULL DEFAULT '/#blogs',
  secondary_cta_label TEXT NOT NULL DEFAULT 'For My Business',
  secondary_cta_href TEXT NOT NULL DEFAULT '/#jobs',
  accent_message TEXT NOT NULL DEFAULT 'Latest market insights and hiring updates.',
  admin_logo_url TEXT,
  public_logo_url TEXT,
  page_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS admin_logo_url TEXT,
ADD COLUMN IF NOT EXISTS public_logo_url TEXT,
ADD COLUMN IF NOT EXISTS page_content JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE site_settings
SET page_content = '{}'::jsonb
WHERE page_content IS NULL;

CREATE INDEX IF NOT EXISTS idx_blogs_status_publish_date ON blogs(status, publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status_publish_date ON jobs(status, publish_date DESC);

INSERT INTO admin_users (id, email, name, password_hash, role)
VALUES (
  'admin-user-1',
  'admin@example.com',
  'Client Admin',
  '$2a$12$o4UvEoq3U0aUKhzi8yQsDuvcEqM75NhS4l6a4HN5ZLVEcUjp8iIKO',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO site_settings (
  id,
  site_title,
  hero_title,
  hero_subtitle,
  primary_cta_label,
  primary_cta_href,
  secondary_cta_label,
  secondary_cta_href,
  accent_message,
  admin_logo_url,
  public_logo_url
)
VALUES (
  'default',
  'Envision Wealth Planning',
  'Align Your Investments & Retirement Plans With What Matters to You.',
  'Thoughtful planning, practical action, and clear communication for every chapter.',
  'For Myself',
  '/#blogs',
  'For My Business',
  '/#jobs',
  'Founder James Brewer wins 2025 ESG Investment Advisor of the Year!',
  'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/evision-wealth-bog-management-5fsiev/assets/67rajg4nyg8i/EW_Logo2022-01-1-1200x282.png',
  'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/evision-wealth-bog-management-5fsiev/assets/67rajg4nyg8i/EW_Logo2022-01-1-1200x282.png'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name, description)
VALUES
  ('cat-1', 'Market Insights', 'Updates on investment and financial planning trends.'),
  ('cat-2', 'Retirement', 'Retirement planning best practices and updates.'),
  ('cat-3', 'Business Planning', 'Guidance for business owners and executives.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tags (id, name)
VALUES
  ('tag-1', 'investing'),
  ('tag-2', 'retirement'),
  ('tag-3', 'business')
ON CONFLICT (id) DO NOTHING;

INSERT INTO blogs (
  id,
  title,
  content,
  publish_date,
  author,
  status,
  category,
  cover_img,
  blog_url,
  summary,
  blog_type,
  vlog_content,
  vlog_embed,
  vlog_url
)
VALUES
  (
    'blog-1',
    '2026 Market Outlook for Families and Founders',
    'This written blog highlights practical allocation changes to consider this year.',
    NOW(),
    'Client Admin',
    'published',
    'Market Insights',
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    '2026-market-outlook',
    'A concise look at allocation and risk posture in 2026.',
    'written',
    NULL,
    NULL,
    NULL
  ),
  (
    'blog-2',
    'Video: Building a Tax-Efficient Retirement Income Plan',
    NULL,
    NOW(),
    'Client Admin',
    'published',
    'Retirement',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    'video-retirement-income-plan',
    'A video walkthrough of retirement income planning fundamentals.',
    'video',
    'In this short video, we break down sequencing, taxes, and withdrawal discipline.',
    'https://www.youtube.com/embed/6Xbtf9W6_5k',
    'https://www.youtube.com/watch?v=6Xbtf9W6_5k'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO blog_tags (blog_id, tag_id)
VALUES
  ('blog-1', 'tag-1'),
  ('blog-1', 'tag-2'),
  ('blog-2', 'tag-2')
ON CONFLICT DO NOTHING;

INSERT INTO jobs (id, title, location, department, summary, apply_url, status, publish_date)
VALUES
  (
    'job-1',
    'Client Relationship Associate',
    'Chicago, IL',
    'Operations',
    'Support client onboarding and advisor communications across planning workflows.',
    'https://example.com/jobs/client-relationship-associate',
    'open',
    NOW()
  ),
  (
    'job-2',
    'Financial Planning Analyst',
    'Remote (US)',
    'Planning',
    'Build plan scenarios, portfolio reviews, and client-ready analysis decks.',
    'https://example.com/jobs/financial-planning-analyst',
    'open',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
