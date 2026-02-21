/*
  Warnings:

  - The `duration` column on the `CalendarUnit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CalendarUnit" DROP COLUMN "duration",
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "CalendarUnitRelation" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
