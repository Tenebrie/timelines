/*
  Warnings:

  - You are about to drop the column `parentId` on the `WikiFolder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WikiFolder" DROP CONSTRAINT "WikiFolder_parentId_fkey";

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "parentFolderPosition" SET DEFAULT 2147483647;

-- AlterTable
ALTER TABLE "WikiFolder" DROP COLUMN "parentId",
ADD COLUMN     "parentFolderId" TEXT;

-- AddForeignKey
ALTER TABLE "WikiFolder" ADD CONSTRAINT "WikiFolder_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "WikiFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
