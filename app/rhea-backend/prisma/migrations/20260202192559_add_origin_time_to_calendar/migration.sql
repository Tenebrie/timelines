/*
  Warnings:

  - You are about to drop the column `dateFormatShorthand` on the `CalendarUnit` table. All the data in the column will be lost.
  - You are about to drop the column `displayFormat` on the `CalendarUnit` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CalendarUnitFormatMode" AS ENUM ('Name', 'NameOneIndexed', 'Numeric', 'NumericOneIndexed', 'Hidden');

-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN     "originTime" BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CalendarUnit" DROP COLUMN "dateFormatShorthand",
DROP COLUMN "displayFormat",
ADD COLUMN     "formatMode" "CalendarUnitFormatMode" NOT NULL DEFAULT 'Name',
ADD COLUMN     "formatShorthand" TEXT;

-- DropEnum
DROP TYPE "CalendarUnitDisplayFormat";
