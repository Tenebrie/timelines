/*
  Warnings:

  - You are about to drop the `UserNotification` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('Info', 'WorldShared');

-- DropForeignKey
ALTER TABLE "UserNotification" DROP CONSTRAINT "UserNotification_userId_fkey";

-- DropTable
DROP TABLE "UserNotification";

-- DropEnum
DROP TYPE "NotificationType";

-- CreateTable
CREATE TABLE "UserAnnouncement" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isUnread" BOOLEAN NOT NULL DEFAULT true,
    "type" "AnnouncementType" NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAnnouncement_id_key" ON "UserAnnouncement"("id");

-- AddForeignKey
ALTER TABLE "UserAnnouncement" ADD CONSTRAINT "UserAnnouncement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
