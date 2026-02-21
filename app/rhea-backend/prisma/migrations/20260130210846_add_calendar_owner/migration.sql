/*
  Warnings:

  - Added the required column `ownerId` to the `Calendar` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Calendar" DROP CONSTRAINT "Calendar_worldId_fkey";

-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN     "ownerId" TEXT NOT NULL,
ALTER COLUMN "worldId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
