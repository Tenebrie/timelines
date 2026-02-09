/*
  Warnings:

  - You are about to drop the column `parentId` on the `CalendarUnit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CalendarUnit" DROP CONSTRAINT "CalendarUnit_parentId_fkey";

-- AlterTable
ALTER TABLE "CalendarUnit" DROP COLUMN "parentId";

-- CreateTable
CREATE TABLE "CalendarUnitRelation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentUnitId" TEXT NOT NULL,
    "childUnitId" TEXT NOT NULL,

    CONSTRAINT "CalendarUnitRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarUnitRelation_id_key" ON "CalendarUnitRelation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarUnitRelation_parentUnitId_childUnitId_key" ON "CalendarUnitRelation"("parentUnitId", "childUnitId");

-- AddForeignKey
ALTER TABLE "CalendarUnitRelation" ADD CONSTRAINT "CalendarUnitRelation_parentUnitId_fkey" FOREIGN KEY ("parentUnitId") REFERENCES "CalendarUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarUnitRelation" ADD CONSTRAINT "CalendarUnitRelation_childUnitId_fkey" FOREIGN KEY ("childUnitId") REFERENCES "CalendarUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
