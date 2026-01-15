-- CreateTable
CREATE TABLE "UserFavoriteIconSet" (
    "id" TEXT NOT NULL,
    "iconSet" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserFavoriteIconSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldCommonIconSet" (
    "id" TEXT NOT NULL,
    "iconSet" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "WorldCommonIconSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFavoriteIconSet_id_key" ON "UserFavoriteIconSet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WorldCommonIconSet_id_key" ON "WorldCommonIconSet"("id");

-- AddForeignKey
ALTER TABLE "UserFavoriteIconSet" ADD CONSTRAINT "UserFavoriteIconSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldCommonIconSet" ADD CONSTRAINT "WorldCommonIconSet_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
