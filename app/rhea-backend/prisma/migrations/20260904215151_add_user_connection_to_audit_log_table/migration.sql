-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'UserAuth';

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN "userId" TEXT;

-- Backfill userId from userEmail
UPDATE "AuditLog"
SET "userId" = "User"."id"
FROM "User"
WHERE "AuditLog"."userEmail" = "User"."email";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "userEmail";

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
