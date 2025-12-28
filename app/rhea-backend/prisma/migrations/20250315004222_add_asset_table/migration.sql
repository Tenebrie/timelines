-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('Image');

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "originalFileExtension" TEXT NOT NULL,
    "contentType" "AssetType" NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_id_key" ON "Asset"("id");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
