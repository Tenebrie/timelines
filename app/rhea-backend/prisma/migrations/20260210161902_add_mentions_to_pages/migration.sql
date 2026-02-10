-- AlterTable
ALTER TABLE "Mention" ADD COLUMN     "pageId" TEXT;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "ContentPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
