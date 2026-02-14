/*
  Warnings:

  - You are about to drop the column `customName` on the `WorldEvent` table. All the data in the column will be lost.
  - You are about to drop the column `externalLink` on the `WorldEvent` table. All the data in the column will be lost.
  - You are about to drop the column `extraFields` on the `WorldEvent` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `WorldEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorldEvent" DROP COLUMN "customName",
DROP COLUMN "externalLink",
DROP COLUMN "extraFields",
DROP COLUMN "type";

-- DropEnum
DROP TYPE "WorldEventField";

-- DropEnum
DROP TYPE "WorldEventType";
