/*
  Warnings:

  - You are about to drop the column `shortName` on the `CalendarUnit` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CalendarUnitDisplayFormat" AS ENUM ('Name', 'Numeric', 'Hidden');

-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN     "dateFormat" TEXT;

-- AlterTable
ALTER TABLE "CalendarUnit" DROP COLUMN "shortName",
ADD COLUMN     "dateFormatShorthand" TEXT,
ADD COLUMN     "displayFormat" "CalendarUnitDisplayFormat" NOT NULL DEFAULT 'Name',
ADD COLUMN     "displayName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "displayNamePlural" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "displayNameShort" TEXT NOT NULL DEFAULT '';
