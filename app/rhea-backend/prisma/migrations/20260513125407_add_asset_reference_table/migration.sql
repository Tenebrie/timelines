-- CreateEnum
CREATE TYPE "ReferenceHoldingEntity" AS ENUM ('Actor', 'Event', 'Article', 'Tag');

-- CreateTable
CREATE TABLE "AssetReference" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assetId" TEXT NOT NULL,
    "holderId" TEXT NOT NULL,
    "holderType" "ReferenceHoldingEntity" NOT NULL,
    "holderActorId" TEXT,
    "holderEventId" TEXT,
    "holderArticleId" TEXT,
    "holderTagId" TEXT,
    "pageId" TEXT,

    CONSTRAINT "AssetReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetReference_id_key" ON "AssetReference"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AssetReference_assetId_holderId_key" ON "AssetReference"("assetId", "holderId");

-- AddForeignKey
ALTER TABLE "AssetReference" ADD CONSTRAINT "AssetReference_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetReference" ADD CONSTRAINT "AssetReference_holderActorId_fkey" FOREIGN KEY ("holderActorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetReference" ADD CONSTRAINT "AssetReference_holderEventId_fkey" FOREIGN KEY ("holderEventId") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetReference" ADD CONSTRAINT "AssetReference_holderArticleId_fkey" FOREIGN KEY ("holderArticleId") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetReference" ADD CONSTRAINT "AssetReference_holderTagId_fkey" FOREIGN KEY ("holderTagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetReference" ADD CONSTRAINT "AssetReference_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "ContentPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
