/*
  Warnings:

  - Added the required column `title` to the `UserAnnouncement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAnnouncement" ADD COLUMN     "title" TEXT NOT NULL;
