/*
  Warnings:

  - You are about to drop the `_worldCollaborator` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CollaboratorAccess" AS ENUM ('ReadOnly', 'Editing');

-- DropForeignKey
ALTER TABLE "_worldCollaborator" DROP CONSTRAINT "_worldCollaborator_A_fkey";

-- DropForeignKey
ALTER TABLE "_worldCollaborator" DROP CONSTRAINT "_worldCollaborator_B_fkey";

-- DropTable
DROP TABLE "_worldCollaborator";

-- CreateTable
CREATE TABLE "CollaboratingUser" (
    "access" "CollaboratorAccess" NOT NULL,
    "userId" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "CollaboratingUser_pkey" PRIMARY KEY ("userId","worldId")
);

-- AddForeignKey
ALTER TABLE "CollaboratingUser" ADD CONSTRAINT "CollaboratingUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratingUser" ADD CONSTRAINT "CollaboratingUser_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
