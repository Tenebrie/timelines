/*
  Warnings:

  - You are about to drop the column `isRead` on the `UserNotification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserNotification" DROP COLUMN "isRead",
ADD COLUMN     "isUnread" BOOLEAN NOT NULL DEFAULT true;
