-- DropForeignKey
ALTER TABLE "CollaboratingUser" DROP CONSTRAINT "CollaboratingUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "CollaboratingUser" DROP CONSTRAINT "CollaboratingUser_worldId_fkey";

-- DropForeignKey
ALTER TABLE "UserAnnouncement" DROP CONSTRAINT "UserAnnouncement_userId_fkey";

-- DropForeignKey
ALTER TABLE "World" DROP CONSTRAINT "World_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "World" ADD CONSTRAINT "World_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratingUser" ADD CONSTRAINT "CollaboratingUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratingUser" ADD CONSTRAINT "CollaboratingUser_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnnouncement" ADD CONSTRAINT "UserAnnouncement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
