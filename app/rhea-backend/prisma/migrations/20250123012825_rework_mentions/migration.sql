/*
  Warnings:

  - You are about to drop the `_ActorMentionedTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ActorMentionedWiki` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventMentionedActors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventMentionedTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventMentionedWiki` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventTargetActors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_WikiMentionedActors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_WikiMentionedEvents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_WikiMentionedTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MentionedEntity" AS ENUM ('Actor', 'Event', 'Article', 'Tag');

-- DropForeignKey
ALTER TABLE "_ActorMentionedTags" DROP CONSTRAINT "_ActorMentionedTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_ActorMentionedTags" DROP CONSTRAINT "_ActorMentionedTags_B_fkey";

-- DropForeignKey
ALTER TABLE "_ActorMentionedWiki" DROP CONSTRAINT "_ActorMentionedWiki_A_fkey";

-- DropForeignKey
ALTER TABLE "_ActorMentionedWiki" DROP CONSTRAINT "_ActorMentionedWiki_B_fkey";

-- DropForeignKey
ALTER TABLE "_EventMentionedActors" DROP CONSTRAINT "_EventMentionedActors_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventMentionedActors" DROP CONSTRAINT "_EventMentionedActors_B_fkey";

-- DropForeignKey
ALTER TABLE "_EventMentionedTags" DROP CONSTRAINT "_EventMentionedTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventMentionedTags" DROP CONSTRAINT "_EventMentionedTags_B_fkey";

-- DropForeignKey
ALTER TABLE "_EventMentionedWiki" DROP CONSTRAINT "_EventMentionedWiki_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventMentionedWiki" DROP CONSTRAINT "_EventMentionedWiki_B_fkey";

-- DropForeignKey
ALTER TABLE "_EventTargetActors" DROP CONSTRAINT "_EventTargetActors_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventTargetActors" DROP CONSTRAINT "_EventTargetActors_B_fkey";

-- DropForeignKey
ALTER TABLE "_WikiMentionedActors" DROP CONSTRAINT "_WikiMentionedActors_A_fkey";

-- DropForeignKey
ALTER TABLE "_WikiMentionedActors" DROP CONSTRAINT "_WikiMentionedActors_B_fkey";

-- DropForeignKey
ALTER TABLE "_WikiMentionedEvents" DROP CONSTRAINT "_WikiMentionedEvents_A_fkey";

-- DropForeignKey
ALTER TABLE "_WikiMentionedEvents" DROP CONSTRAINT "_WikiMentionedEvents_B_fkey";

-- DropForeignKey
ALTER TABLE "_WikiMentionedTags" DROP CONSTRAINT "_WikiMentionedTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_WikiMentionedTags" DROP CONSTRAINT "_WikiMentionedTags_B_fkey";

-- DropTable
DROP TABLE "_ActorMentionedTags";

-- DropTable
DROP TABLE "_ActorMentionedWiki";

-- DropTable
DROP TABLE "_EventMentionedActors";

-- DropTable
DROP TABLE "_EventMentionedTags";

-- DropTable
DROP TABLE "_EventMentionedWiki";

-- DropTable
DROP TABLE "_EventTargetActors";

-- DropTable
DROP TABLE "_WikiMentionedActors";

-- DropTable
DROP TABLE "_WikiMentionedEvents";

-- DropTable
DROP TABLE "_WikiMentionedTags";

-- CreateTable
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL,
    "sourceActorId" TEXT,
    "sourceEventId" TEXT,
    "sourceArticleId" TEXT,
    "sourceTagId" TEXT,
    "targetActorId" TEXT,
    "targetEventId" TEXT,
    "targetArticleId" TEXT,
    "targetTagId" TEXT,
    "sourceType" "MentionedEntity" NOT NULL,
    "targetType" "MentionedEntity" NOT NULL,

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mention_sourceActorId_sourceEventId_sourceArticleId_sourceT_key" ON "Mention"("sourceActorId", "sourceEventId", "sourceArticleId", "sourceTagId", "targetActorId", "targetEventId", "targetArticleId", "targetTagId");

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_sourceActorId_fkey" FOREIGN KEY ("sourceActorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_sourceEventId_fkey" FOREIGN KEY ("sourceEventId") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_sourceArticleId_fkey" FOREIGN KEY ("sourceArticleId") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_sourceTagId_fkey" FOREIGN KEY ("sourceTagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_targetActorId_fkey" FOREIGN KEY ("targetActorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_targetEventId_fkey" FOREIGN KEY ("targetEventId") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_targetArticleId_fkey" FOREIGN KEY ("targetArticleId") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_targetTagId_fkey" FOREIGN KEY ("targetTagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
