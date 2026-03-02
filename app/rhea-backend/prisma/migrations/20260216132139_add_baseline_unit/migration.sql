/*
  Warnings:

  - Added the required column `baselineUnitId` to the `CalendarPresentation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CalendarPresentation" ADD COLUMN     "baselineUnitId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CalendarPresentation" ADD CONSTRAINT "CalendarPresentation_baselineUnitId_fkey" FOREIGN KEY ("baselineUnitId") REFERENCES "CalendarUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
