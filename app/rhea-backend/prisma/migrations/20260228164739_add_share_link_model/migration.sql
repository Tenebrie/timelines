-- CreateTable
CREATE TABLE "WorldShareLink" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,
    "label" TEXT,
    "expiresAt" TIMESTAMP(3),
    "accessMode" "WorldAccessMode" NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "WorldShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorldShareLink_id_key" ON "WorldShareLink"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WorldShareLink_slug_key" ON "WorldShareLink"("slug");

-- AddForeignKey
ALTER TABLE "WorldShareLink" ADD CONSTRAINT "WorldShareLink_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
