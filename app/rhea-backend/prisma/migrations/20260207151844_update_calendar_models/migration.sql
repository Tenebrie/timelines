-- CreateEnum
CREATE TYPE "CalendarUnitNegativeFormat" AS ENUM ('MinusSign', 'AbsoluteValue');

-- AlterTable
ALTER TABLE "CalendarUnit" ADD COLUMN     "negativeFormat" "CalendarUnitNegativeFormat" NOT NULL DEFAULT 'MinusSign';

-- CreateTable
CREATE TABLE "CalendarPresentation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "scaleFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "calendarId" TEXT NOT NULL,

    CONSTRAINT "CalendarPresentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarPresentationUnit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "formatString" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "presentationId" TEXT NOT NULL,

    CONSTRAINT "CalendarPresentationUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarSeason" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "formatShorthand" TEXT,
    "calendarId" TEXT NOT NULL,

    CONSTRAINT "CalendarSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarSeasonInterval" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftIndex" INTEGER NOT NULL,
    "rightIndex" INTEGER NOT NULL,
    "seasonId" TEXT NOT NULL,

    CONSTRAINT "CalendarSeasonInterval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarPresentation_id_key" ON "CalendarPresentation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarPresentationUnit_id_key" ON "CalendarPresentationUnit"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarSeason_id_key" ON "CalendarSeason"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarSeasonInterval_id_key" ON "CalendarSeasonInterval"("id");

-- AddForeignKey
ALTER TABLE "CalendarPresentation" ADD CONSTRAINT "CalendarPresentation_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarPresentationUnit" ADD CONSTRAINT "CalendarPresentationUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CalendarUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarPresentationUnit" ADD CONSTRAINT "CalendarPresentationUnit_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "CalendarPresentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarSeason" ADD CONSTRAINT "CalendarSeason_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarSeasonInterval" ADD CONSTRAINT "CalendarSeasonInterval_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "CalendarSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
