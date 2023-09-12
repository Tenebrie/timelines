/*
  Warnings:

  - You are about to drop the column `customName` on the `WorldEventDelta` table. All the data in the column will be lost.
  - Made the column `description` on table `WorldEventDelta` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WorldEventDelta" DROP COLUMN "customName",
ALTER COLUMN "description" SET NOT NULL;
