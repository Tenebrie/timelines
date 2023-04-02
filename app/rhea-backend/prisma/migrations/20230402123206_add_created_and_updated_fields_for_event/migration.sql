/*
  Warnings:

  - Added the required column `updated_at` to the `WorldEvent` table without a default value. This is not possible if the table is not empty.
  - Made the column `issuedByEventId` on table `WorldStatement` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "WorldStatement" DROP CONSTRAINT "WorldStatement_issuedByEventId_fkey";

-- AlterTable
ALTER TABLE "WorldEvent" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- AlterTable
DELETE FROM "WorldStatement";
ALTER TABLE "WorldStatement" ALTER COLUMN "issuedByEventId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "WorldStatement" ADD CONSTRAINT "WorldStatement_issuedByEventId_fkey" FOREIGN KEY ("issuedByEventId") REFERENCES "WorldEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
