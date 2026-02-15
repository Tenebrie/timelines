-- AlterTable
ALTER TABLE "Calendar" ALTER COLUMN "position" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "CalendarUnit" ALTER COLUMN "duration" SET DATA TYPE BIGINT,
ALTER COLUMN "position" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "CalendarUnitRelation" ALTER COLUMN "position" SET DEFAULT 0;
