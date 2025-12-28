-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('Pending', 'Finalized', 'Failed');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "status" "AssetStatus" NOT NULL DEFAULT 'Pending';
