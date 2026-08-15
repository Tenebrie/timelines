-- RenameColumn: standardize content field naming on Actor/WorldEvent/ContentPage
ALTER TABLE "Actor" RENAME COLUMN "description" TO "content";
ALTER TABLE "Actor" RENAME COLUMN "descriptionRich" TO "contentRich";

ALTER TABLE "WorldEvent" RENAME COLUMN "description" TO "content";
ALTER TABLE "WorldEvent" RENAME COLUMN "descriptionRich" TO "contentRich";

ALTER TABLE "ContentPage" RENAME COLUMN "description" TO "content";
ALTER TABLE "ContentPage" RENAME COLUMN "descriptionRich" TO "contentRich";

-- AlterTable: add discriminator column to ContentPage, mirroring Mention.sourceType/targetType
-- and AssetReference.holderType
ALTER TABLE "ContentPage" ADD COLUMN "parentType" "MentionedEntity";

UPDATE "ContentPage" SET "parentType" = 'Actor' WHERE "parentActorId" IS NOT NULL;
UPDATE "ContentPage" SET "parentType" = 'Event' WHERE "parentEventId" IS NOT NULL;
UPDATE "ContentPage" SET "parentType" = 'Article' WHERE "parentArticleId" IS NOT NULL;

ALTER TABLE "ContentPage" ALTER COLUMN "parentType" SET NOT NULL;
