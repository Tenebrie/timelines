-- Backfill entities still using the legacy default color (#000000)
-- to the new per-entity defaults. Custom colors are left untouched.

UPDATE "Actor" SET "color" = '#11ac26' WHERE "color" = '#000000';

UPDATE "WorldEvent" SET "color" = '#efb45e' WHERE "color" = '#000000';

UPDATE "WikiArticle" SET "color" = '#3a92e4' WHERE "color" = '#000000';
