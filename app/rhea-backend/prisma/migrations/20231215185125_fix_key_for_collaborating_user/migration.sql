/*
  Warnings:

  - The primary key for the `CollaboratingUser` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "CollaboratingUser_userId_worldId_key";

-- AlterTable
ALTER TABLE "CollaboratingUser" DROP CONSTRAINT "CollaboratingUser_pkey",
ADD CONSTRAINT "CollaboratingUser_pkey" PRIMARY KEY ("userId", "worldId");
