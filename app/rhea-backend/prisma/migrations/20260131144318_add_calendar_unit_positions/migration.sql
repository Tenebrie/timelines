-- AlterTable
ALTER TABLE "CalendarUnit" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CalendarUnitRelation" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;
