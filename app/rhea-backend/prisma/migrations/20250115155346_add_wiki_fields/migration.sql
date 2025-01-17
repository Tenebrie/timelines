/*
  Warnings:

  - You are about to drop the `ActorRelationship` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventIntroducedActors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventTerminatedActors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActorRelationship" DROP CONSTRAINT "ActorRelationship_originId_fkey";

-- DropForeignKey
ALTER TABLE "ActorRelationship" DROP CONSTRAINT "ActorRelationship_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "_EventIntroducedActors" DROP CONSTRAINT "_EventIntroducedActors_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventIntroducedActors" DROP CONSTRAINT "_EventIntroducedActors_B_fkey";

-- DropForeignKey
ALTER TABLE "_EventTerminatedActors" DROP CONSTRAINT "_EventTerminatedActors_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventTerminatedActors" DROP CONSTRAINT "_EventTerminatedActors_B_fkey";

-- DropTable
DROP TABLE "ActorRelationship";

-- DropTable
DROP TABLE "_EventIntroducedActors";

-- DropTable
DROP TABLE "_EventTerminatedActors";

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WikiArticle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "descriptionRich" TEXT NOT NULL DEFAULT '',
    "worldId" TEXT NOT NULL,

    CONSTRAINT "WikiArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ActorMentionedTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActorMentionedTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActorMentionedWiki" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActorMentionedWiki_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_WikiMentionedActors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WikiMentionedActors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventMentionedTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventMentionedTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_WikiMentionedEvents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WikiMentionedEvents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventMentionedWiki" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventMentionedWiki_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_id_key" ON "Tag"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WikiArticle_id_key" ON "WikiArticle"("id");

-- CreateIndex
CREATE INDEX "_ActorMentionedTags_B_index" ON "_ActorMentionedTags"("B");

-- CreateIndex
CREATE INDEX "_ActorMentionedWiki_B_index" ON "_ActorMentionedWiki"("B");

-- CreateIndex
CREATE INDEX "_WikiMentionedActors_B_index" ON "_WikiMentionedActors"("B");

-- CreateIndex
CREATE INDEX "_EventMentionedTags_B_index" ON "_EventMentionedTags"("B");

-- CreateIndex
CREATE INDEX "_WikiMentionedEvents_B_index" ON "_WikiMentionedEvents"("B");

-- CreateIndex
CREATE INDEX "_EventMentionedWiki_B_index" ON "_EventMentionedWiki"("B");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiArticle" ADD CONSTRAINT "WikiArticle_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActorMentionedTags" ADD CONSTRAINT "_ActorMentionedTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActorMentionedTags" ADD CONSTRAINT "_ActorMentionedTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActorMentionedWiki" ADD CONSTRAINT "_ActorMentionedWiki_A_fkey" FOREIGN KEY ("A") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActorMentionedWiki" ADD CONSTRAINT "_ActorMentionedWiki_B_fkey" FOREIGN KEY ("B") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WikiMentionedActors" ADD CONSTRAINT "_WikiMentionedActors_A_fkey" FOREIGN KEY ("A") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WikiMentionedActors" ADD CONSTRAINT "_WikiMentionedActors_B_fkey" FOREIGN KEY ("B") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventMentionedTags" ADD CONSTRAINT "_EventMentionedTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventMentionedTags" ADD CONSTRAINT "_EventMentionedTags_B_fkey" FOREIGN KEY ("B") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WikiMentionedEvents" ADD CONSTRAINT "_WikiMentionedEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WikiMentionedEvents" ADD CONSTRAINT "_WikiMentionedEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventMentionedWiki" ADD CONSTRAINT "_EventMentionedWiki_A_fkey" FOREIGN KEY ("A") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventMentionedWiki" ADD CONSTRAINT "_EventMentionedWiki_B_fkey" FOREIGN KEY ("B") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
