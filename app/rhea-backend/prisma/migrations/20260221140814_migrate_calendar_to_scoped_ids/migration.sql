-- Migrate calendar child entities to scoped composite keys (calendarId, id)
-- Three tables need calendarId backfilled from parent relations:
--   CalendarUnitRelation  -> via parentUnitId -> CalendarUnit.calendarId
--   CalendarPresentationUnit -> via presentationId -> CalendarPresentation.calendarId
--   CalendarSeasonInterval -> via seasonId -> CalendarSeason.calendarId

-- ============================================================
-- Step 1: Drop old foreign keys (before we change any PKs)
-- ============================================================
ALTER TABLE "CalendarPresentation" DROP CONSTRAINT "CalendarPresentation_baselineUnitId_fkey";
ALTER TABLE "CalendarPresentationUnit" DROP CONSTRAINT "CalendarPresentationUnit_presentationId_fkey";
ALTER TABLE "CalendarPresentationUnit" DROP CONSTRAINT "CalendarPresentationUnit_unitId_fkey";
ALTER TABLE "CalendarSeasonInterval" DROP CONSTRAINT "CalendarSeasonInterval_seasonId_fkey";
ALTER TABLE "CalendarUnitRelation" DROP CONSTRAINT "CalendarUnitRelation_childUnitId_fkey";
ALTER TABLE "CalendarUnitRelation" DROP CONSTRAINT "CalendarUnitRelation_parentUnitId_fkey";

-- ============================================================
-- Step 2: Drop old unique indexes (id was @unique before)
-- ============================================================
DROP INDEX "CalendarPresentation_id_key";
DROP INDEX "CalendarPresentationUnit_id_key";
DROP INDEX "CalendarSeason_id_key";
DROP INDEX "CalendarSeasonInterval_id_key";
DROP INDEX "CalendarUnit_id_key";
DROP INDEX "CalendarUnitRelation_id_key";

-- ============================================================
-- Step 3: Add calendarId as NULLABLE to the three tables that
--         didn't have it, then backfill from parent relations
-- ============================================================

-- CalendarUnitRelation: derive calendarId from parentUnit
ALTER TABLE "CalendarUnitRelation" ADD COLUMN "calendarId" TEXT;
UPDATE "CalendarUnitRelation" r
  SET "calendarId" = u."calendarId"
  FROM "CalendarUnit" u
  WHERE r."parentUnitId" = u."id";
ALTER TABLE "CalendarUnitRelation" ALTER COLUMN "calendarId" SET NOT NULL;

-- CalendarPresentationUnit: derive calendarId from presentation
ALTER TABLE "CalendarPresentationUnit" ADD COLUMN "calendarId" TEXT;
UPDATE "CalendarPresentationUnit" pu
  SET "calendarId" = p."calendarId"
  FROM "CalendarPresentation" p
  WHERE pu."presentationId" = p."id";
ALTER TABLE "CalendarPresentationUnit" ALTER COLUMN "calendarId" SET NOT NULL;

-- CalendarSeasonInterval: derive calendarId from season
ALTER TABLE "CalendarSeasonInterval" ADD COLUMN "calendarId" TEXT;
UPDATE "CalendarSeasonInterval" si
  SET "calendarId" = s."calendarId"
  FROM "CalendarSeason" s
  WHERE si."seasonId" = s."id";
ALTER TABLE "CalendarSeasonInterval" ALTER COLUMN "calendarId" SET NOT NULL;

-- ============================================================
-- Step 4: Clean up orphaned cross-calendar references
--         Some CalendarPresentation rows have a baselineUnitId
--         pointing to a CalendarUnit from a different calendar.
--         Null those out before adding composite FKs.
-- ============================================================
UPDATE "CalendarPresentation" p
  SET "baselineUnitId" = NULL
  WHERE p."baselineUnitId" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM "CalendarUnit" u
      WHERE u."id" = p."baselineUnitId"
        AND u."calendarId" = p."calendarId"
    );

-- ============================================================
-- Step 5: Change primary keys to composite (calendarId, id)
-- ============================================================
ALTER TABLE "CalendarUnit" DROP CONSTRAINT "CalendarUnit_pkey",
ADD CONSTRAINT "CalendarUnit_pkey" PRIMARY KEY ("calendarId", "id");

ALTER TABLE "CalendarUnitRelation" DROP CONSTRAINT "CalendarUnitRelation_pkey",
ADD CONSTRAINT "CalendarUnitRelation_pkey" PRIMARY KEY ("calendarId", "id");

ALTER TABLE "CalendarPresentation" DROP CONSTRAINT "CalendarPresentation_pkey",
ADD CONSTRAINT "CalendarPresentation_pkey" PRIMARY KEY ("calendarId", "id");

ALTER TABLE "CalendarPresentationUnit" DROP CONSTRAINT "CalendarPresentationUnit_pkey",
ADD CONSTRAINT "CalendarPresentationUnit_pkey" PRIMARY KEY ("calendarId", "id");

ALTER TABLE "CalendarSeason" DROP CONSTRAINT "CalendarSeason_pkey",
ADD CONSTRAINT "CalendarSeason_pkey" PRIMARY KEY ("calendarId", "id");

ALTER TABLE "CalendarSeasonInterval" DROP CONSTRAINT "CalendarSeasonInterval_pkey",
ADD CONSTRAINT "CalendarSeasonInterval_pkey" PRIMARY KEY ("calendarId", "id");

-- ============================================================
-- Step 6: Add new composite foreign keys
-- ============================================================
ALTER TABLE "CalendarUnitRelation" ADD CONSTRAINT "CalendarUnitRelation_calendarId_parentUnitId_fkey"
  FOREIGN KEY ("calendarId", "parentUnitId") REFERENCES "CalendarUnit"("calendarId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CalendarUnitRelation" ADD CONSTRAINT "CalendarUnitRelation_calendarId_childUnitId_fkey"
  FOREIGN KEY ("calendarId", "childUnitId") REFERENCES "CalendarUnit"("calendarId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CalendarPresentation" ADD CONSTRAINT "CalendarPresentation_calendarId_baselineUnitId_fkey"
  FOREIGN KEY ("calendarId", "baselineUnitId") REFERENCES "CalendarUnit"("calendarId", "id") ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE "CalendarPresentationUnit" ADD CONSTRAINT "CalendarPresentationUnit_calendarId_unitId_fkey"
  FOREIGN KEY ("calendarId", "unitId") REFERENCES "CalendarUnit"("calendarId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CalendarPresentationUnit" ADD CONSTRAINT "CalendarPresentationUnit_calendarId_presentationId_fkey"
  FOREIGN KEY ("calendarId", "presentationId") REFERENCES "CalendarPresentation"("calendarId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CalendarSeasonInterval" ADD CONSTRAINT "CalendarSeasonInterval_calendarId_seasonId_fkey"
  FOREIGN KEY ("calendarId", "seasonId") REFERENCES "CalendarSeason"("calendarId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
