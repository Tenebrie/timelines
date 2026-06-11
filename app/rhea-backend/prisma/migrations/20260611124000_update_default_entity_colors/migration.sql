/*
  Warnings:

  - You are about to drop the column `contentYjs` on the `WikiArticle` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `WikiArticle` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `WikiArticle` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WikiArticle" DROP CONSTRAINT "WikiArticle_parentId_fkey";

-- AlterTable
ALTER TABLE "Actor" ALTER COLUMN "color" SET DEFAULT '#11ac26';

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#e43a8f';

-- AlterTable
ALTER TABLE "WikiArticle" DROP COLUMN "contentYjs",
DROP COLUMN "parentId",
DROP COLUMN "position";

-- AlterTable
ALTER TABLE "WikiFolder" ALTER COLUMN "color" SET DEFAULT '#3a92e4';

-- AlterTable
ALTER TABLE "WorldEvent" ALTER COLUMN "color" SET DEFAULT '#efb45e';
