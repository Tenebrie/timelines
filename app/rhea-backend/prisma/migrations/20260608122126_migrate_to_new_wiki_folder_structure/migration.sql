-- Build a mapping: old implicit-folder article id → new WikiFolder id.
-- An implicit folder is any article that has at least one child article.
CREATE TEMP TABLE folder_id_map AS
SELECT
    a.id              AS old_article_id,
    gen_random_uuid()::TEXT AS new_folder_id
FROM "WikiArticle" a
WHERE EXISTS (
    SELECT 1 FROM "WikiArticle" child WHERE child."parentId" = a.id
);

-- Create WikiFolder rows from each implicit-folder article.
-- parentFolderId is left NULL here and wired in the next step.
INSERT INTO "WikiFolder" (id, "createdAt", "updatedAt", name, icon, color, "worldId", "parentFolderPosition")
SELECT
    m.new_folder_id,
    a."createdAt",
    a."updatedAt",
    a.name,
    a.icon,
    a.color,
    a."worldId",
    a.position
FROM folder_id_map m
JOIN "WikiArticle" a ON a.id = m.old_article_id;

-- Wire up folder→folder nesting for implicit folders that were themselves
-- children of another implicit folder.
UPDATE "WikiFolder" f
SET
    "parentFolderId"       = pm.new_folder_id,
    "parentFolderPosition" = a.position
FROM folder_id_map m
JOIN "WikiArticle"  a  ON a.id = m.old_article_id
JOIN folder_id_map  pm ON pm.old_article_id = a."parentId"
WHERE f.id = m.new_folder_id;

-- Implicit-folder articles become child articles of their own new folder,
-- pinned first (position -1).
UPDATE "WikiArticle" a
SET
    "parentFolderId"       = m.new_folder_id,
    "parentFolderPosition" = -1
FROM folder_id_map m
WHERE a.id = m.old_article_id;

-- Leaf articles move to their parent's new folder, preserving their position.
UPDATE "WikiArticle" a
SET
    "parentFolderId"       = m.new_folder_id,
    "parentFolderPosition" = a.position
FROM folder_id_map m
WHERE a."parentId" = m.old_article_id
  AND a.id NOT IN (SELECT old_article_id FROM folder_id_map);

-- Root-level leaf articles (no old parentId, not an implicit folder) preserve their global position.
UPDATE "WikiArticle" a
SET "parentFolderPosition" = a.position
WHERE a."parentId" IS NULL
  AND a.id NOT IN (SELECT old_article_id FROM folder_id_map);

-- Normalize parentFolderPosition for events, actors, and tags.
-- All were created with the default value of 0; assign sequential multiples
-- of 2 within each world so the first user-initiated sort does not scramble them.
UPDATE "Actor" a
SET "parentFolderPosition" = sub.new_position
FROM (
    SELECT
        id,
        100000 + (ROW_NUMBER() OVER (PARTITION BY "worldId" ORDER BY "createdAt") - 1) * 2 AS new_position
    FROM "Actor"
) sub
WHERE a.id = sub.id;

UPDATE "WorldEvent" e
SET "parentFolderPosition" = sub.new_position
FROM (
    SELECT
        id,
        200000 + (ROW_NUMBER() OVER (PARTITION BY "worldId" ORDER BY "timestamp") - 1) * 2 AS new_position
    FROM "WorldEvent"
) sub
WHERE e.id = sub.id;

UPDATE "Tag" t
SET "parentFolderPosition" = sub.new_position
FROM (
    SELECT
        id,
        300000 + (ROW_NUMBER() OVER (PARTITION BY "worldId" ORDER BY "createdAt") - 1) * 2 AS new_position
    FROM "Tag"
) sub
WHERE t.id = sub.id;