-- AlterTable
ALTER TABLE "Actor" ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'default',
ALTER COLUMN "color" SET DEFAULT '#000000';

-- AlterTable
ALTER TABLE "WikiArticle" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE "WorldEvent" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#000000';
