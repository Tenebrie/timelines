/*
  Warnings:

  - You are about to drop the column `descriptionRich` on the `WikiArticle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WikiArticle" DROP COLUMN "descriptionRich",
ADD COLUMN     "contentRich" TEXT NOT NULL DEFAULT '';
