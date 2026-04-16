-- CreateEnum
CREATE TYPE "FeatureFlag" AS ENUM ('MindmapRework');

-- CreateTable
CREATE TABLE "FeatureFlagEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "flag" "FeatureFlag" NOT NULL,

    CONSTRAINT "FeatureFlagEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlagEntry_id_key" ON "FeatureFlagEntry"("id");

-- AddForeignKey
ALTER TABLE "FeatureFlagEntry" ADD CONSTRAINT "FeatureFlagEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
