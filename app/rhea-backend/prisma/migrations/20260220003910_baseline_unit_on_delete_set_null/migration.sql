-- DropForeignKey
ALTER TABLE "CalendarPresentation" DROP CONSTRAINT "CalendarPresentation_baselineUnitId_fkey";

-- AddForeignKey
ALTER TABLE "CalendarPresentation" ADD CONSTRAINT "CalendarPresentation_baselineUnitId_fkey" FOREIGN KEY ("baselineUnitId") REFERENCES "CalendarUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
