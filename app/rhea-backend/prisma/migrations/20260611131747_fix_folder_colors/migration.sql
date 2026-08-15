-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "color" SET DEFAULT '#9f2261';
UPDATE "WikiFolder" SET "color" = '#9f7eed' WHERE "color" = '#000000';