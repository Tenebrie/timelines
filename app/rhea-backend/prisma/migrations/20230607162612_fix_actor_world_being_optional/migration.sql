/*
  Warnings:

  - Made the column `worldId` on table `Actor` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Actor" DROP CONSTRAINT "Actor_worldId_fkey";

-- AlterTable
ALTER TABLE "Actor" ALTER COLUMN "worldId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Actor" ADD CONSTRAINT "Actor_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
