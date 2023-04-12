/*
  Warnings:

  - You are about to alter the column `timestamp` on the `WorldEvent` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "World" ALTER COLUMN "timeOrigin" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "WorldEvent" ALTER COLUMN "timestamp" SET DATA TYPE BIGINT;
