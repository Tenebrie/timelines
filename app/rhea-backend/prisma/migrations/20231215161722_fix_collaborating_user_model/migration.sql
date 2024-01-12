/*
  Warnings:

  - The primary key for the `CollaboratingUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,worldId]` on the table `CollaboratingUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CollaboratingUser" DROP CONSTRAINT "CollaboratingUser_pkey",
ADD CONSTRAINT "CollaboratingUser_pkey" PRIMARY KEY ("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CollaboratingUser_userId_worldId_key" ON "CollaboratingUser"("userId", "worldId");
