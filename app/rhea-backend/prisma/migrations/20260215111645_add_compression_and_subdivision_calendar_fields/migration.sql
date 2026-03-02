-- AlterTable
ALTER TABLE "CalendarPresentation" ADD COLUMN     "compression" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "CalendarPresentationUnit" ADD COLUMN     "subdivision" INTEGER NOT NULL DEFAULT 1;
