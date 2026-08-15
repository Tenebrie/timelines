-- AlterTable
ALTER TABLE "Actor" ADD COLUMN     "parentFolderId" TEXT,
ADD COLUMN     "parentFolderPosition" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "parentFolderId" TEXT,
ADD COLUMN     "parentFolderPosition" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "WikiArticle" ADD COLUMN     "parentFolderId" TEXT,
ADD COLUMN     "parentFolderPosition" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "WorldEvent" ADD COLUMN     "parentFolderId" TEXT,
ADD COLUMN     "parentFolderPosition" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "WikiFolder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'default',
    "color" TEXT NOT NULL DEFAULT '#000000',
    "worldId" TEXT NOT NULL,
    "parentId" TEXT,
    "parentFolderPosition" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WikiFolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WikiFolder_id_key" ON "WikiFolder"("id");

-- AddForeignKey
ALTER TABLE "Actor" ADD CONSTRAINT "Actor_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "WikiFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "WikiFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiArticle" ADD CONSTRAINT "WikiArticle_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "WikiFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiFolder" ADD CONSTRAINT "WikiFolder_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiFolder" ADD CONSTRAINT "WikiFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WikiFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldEvent" ADD CONSTRAINT "WorldEvent_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "WikiFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
