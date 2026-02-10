-- CreateTable
CREATE TABLE "ContentPage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "descriptionRich" TEXT NOT NULL DEFAULT '',
    "descriptionYjs" TEXT,
    "parentActorId" TEXT,
    "parentEventId" TEXT,
    "parentArticleId" TEXT,

    CONSTRAINT "ContentPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentPage_id_key" ON "ContentPage"("id");

-- AddForeignKey
ALTER TABLE "ContentPage" ADD CONSTRAINT "ContentPage_parentActorId_fkey" FOREIGN KEY ("parentActorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPage" ADD CONSTRAINT "ContentPage_parentEventId_fkey" FOREIGN KEY ("parentEventId") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPage" ADD CONSTRAINT "ContentPage_parentArticleId_fkey" FOREIGN KEY ("parentArticleId") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
