INSERT INTO users (first_name, last_name, email, password_hash, role)
SELECT
    'Admin',
    'User',
    'admin@example.com',
    '$2a$12$o4UvEoq3U0aUKhzi8yQsDuvcEqM75NhS4l6a4HN5ZLVEcUjp8iIKO',
    'admin'
WHERE
    NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');

INSERT INTO categories (name, slug, description)
VALUES
    ('Engineering', 'engineering', 'Technical deep dives and engineering updates'),
    ('Design', 'design', 'Design systems, case studies, and accessibility resources'),
    ('Product', 'product', 'Product announcements, roadmaps, and release notes')
ON CONFLICT (slug) DO NOTHING;

WITH author AS (
    SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1
)
INSERT INTO posts (title, slug, excerpt, content, cover_image_url, status, published_at, author_id, is_featured)
SELECT
    'Welcome to the Blog Management App',
    'welcome-to-the-blog-management-app',
    'A tour of the foundational features included in this starter project.',
    '## Getting Started\n\nThis starter blog management application ships with a secure admin panel, content workflows, and a reader-friendly landing page.\n\n- Create, edit, and publish posts\n- Manage categories for structured browsing\n- Onboard additional collaborators with role-based permissions\n\nHappy publishing!',
    NULL,
    'published',
    NOW(),
    author.id,
    TRUE
FROM author
WHERE NOT EXISTS (
    SELECT 1 FROM posts WHERE slug = 'welcome-to-the-blog-management-app'
);

INSERT INTO post_categories (post_id, category_id)
SELECT p.id, c.id
FROM posts p
JOIN LATERAL (
    SELECT id FROM categories WHERE slug IN ('engineering', 'product')
) AS c ON TRUE
WHERE p.slug = 'welcome-to-the-blog-management-app'
ON CONFLICT DO NOTHING;
