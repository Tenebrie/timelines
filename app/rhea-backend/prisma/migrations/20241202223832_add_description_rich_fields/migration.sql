-- AlterTable
ALTER TABLE "WorldEvent" ADD COLUMN     "descriptionRich" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "WorldEventDelta" ADD COLUMN     "descriptionRich" TEXT;

-- Update
UPDATE "WorldEvent" SET "descriptionRich" = "description";

-- Update
UPDATE "WorldEventDelta" SET "descriptionRich" = "description";
