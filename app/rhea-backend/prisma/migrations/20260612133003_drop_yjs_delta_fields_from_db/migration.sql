/*
  Warnings:

  - You are about to drop the column `descriptionYjs` on the `Actor` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionYjs` on the `ContentPage` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionYjs` on the `WorldEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Actor" DROP COLUMN "descriptionYjs";

-- AlterTable
ALTER TABLE "ContentPage" DROP COLUMN "descriptionYjs";

-- AlterTable
ALTER TABLE "WikiArticle" ADD COLUMN     "content" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "WorldEvent" DROP COLUMN "descriptionYjs";
