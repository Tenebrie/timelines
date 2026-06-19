-- AlterTable
ALTER TABLE "Actor" ALTER COLUMN "parentFolderPosition" SET DEFAULT 0,
ALTER COLUMN "parentFolderPosition" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "parentFolderPosition" SET DEFAULT 0,
ALTER COLUMN "parentFolderPosition" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "WikiArticle" ALTER COLUMN "parentFolderPosition" SET DEFAULT 0,
ALTER COLUMN "parentFolderPosition" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "WikiFolder" ALTER COLUMN "parentFolderPosition" SET DEFAULT 0,
ALTER COLUMN "parentFolderPosition" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "WorldEvent" ALTER COLUMN "parentFolderPosition" SET DEFAULT 0,
ALTER COLUMN "parentFolderPosition" SET DATA TYPE DOUBLE PRECISION;
