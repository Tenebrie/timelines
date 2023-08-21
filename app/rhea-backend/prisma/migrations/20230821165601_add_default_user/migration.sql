-- CreateEnum
CREATE TYPE "UserLevel" AS ENUM ('Free', 'Premium', 'Admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "level" "UserLevel" NOT NULL DEFAULT 'Free';
