-- DropForeignKey
ALTER TABLE "WorldStatement" DROP CONSTRAINT "WorldStatement_issuedByEventId_fkey";

-- DropForeignKey
ALTER TABLE "WorldStatement" DROP CONSTRAINT "WorldStatement_revokedByEventId_fkey";

-- AlterTable
ALTER TABLE "WorldStatement" ALTER COLUMN "issuedByEventId" DROP NOT NULL,
ALTER COLUMN "revokedByEventId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WorldStatement" ADD CONSTRAINT "WorldStatement_issuedByEventId_fkey" FOREIGN KEY ("issuedByEventId") REFERENCES "WorldEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldStatement" ADD CONSTRAINT "WorldStatement_revokedByEventId_fkey" FOREIGN KEY ("revokedByEventId") REFERENCES "WorldEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
