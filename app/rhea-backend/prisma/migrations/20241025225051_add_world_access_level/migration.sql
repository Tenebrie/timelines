-- CreateEnum
CREATE TYPE "WorldAccessMode" AS ENUM ('Private', 'PublicRead', 'PublicEdit');

-- AlterTable
ALTER TABLE "World" ADD COLUMN     "accessMode" "WorldAccessMode" NOT NULL DEFAULT 'Private';
