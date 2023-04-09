-- CreateEnum
CREATE TYPE "WorldCalendarType" AS ENUM ('COUNTUP', 'EARTH');

-- AlterTable
ALTER TABLE "World" ADD COLUMN     "calendar" "WorldCalendarType" NOT NULL DEFAULT 'COUNTUP',
ADD COLUMN     "timeOrigin" INTEGER NOT NULL DEFAULT 0;
