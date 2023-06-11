/*
  Warnings:

  - You are about to drop the `_ActorToWorldStatement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ActorToWorldStatement" DROP CONSTRAINT "_ActorToWorldStatement_A_fkey";

-- DropForeignKey
ALTER TABLE "_ActorToWorldStatement" DROP CONSTRAINT "_ActorToWorldStatement_B_fkey";

-- DropTable
DROP TABLE "_ActorToWorldStatement";

-- CreateTable
CREATE TABLE "_EventTargetActors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EventMentionedActors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EventTargetActors_AB_unique" ON "_EventTargetActors"("A", "B");

-- CreateIndex
CREATE INDEX "_EventTargetActors_B_index" ON "_EventTargetActors"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventMentionedActors_AB_unique" ON "_EventMentionedActors"("A", "B");

-- CreateIndex
CREATE INDEX "_EventMentionedActors_B_index" ON "_EventMentionedActors"("B");

-- AddForeignKey
ALTER TABLE "_EventTargetActors" ADD CONSTRAINT "_EventTargetActors_A_fkey" FOREIGN KEY ("A") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventTargetActors" ADD CONSTRAINT "_EventTargetActors_B_fkey" FOREIGN KEY ("B") REFERENCES "WorldStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventMentionedActors" ADD CONSTRAINT "_EventMentionedActors_A_fkey" FOREIGN KEY ("A") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventMentionedActors" ADD CONSTRAINT "_EventMentionedActors_B_fkey" FOREIGN KEY ("B") REFERENCES "WorldStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
