-- CreateTable
CREATE TABLE "_EventIntroducedActors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EventTerminatedActors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EventIntroducedActors_AB_unique" ON "_EventIntroducedActors"("A", "B");

-- CreateIndex
CREATE INDEX "_EventIntroducedActors_B_index" ON "_EventIntroducedActors"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventTerminatedActors_AB_unique" ON "_EventTerminatedActors"("A", "B");

-- CreateIndex
CREATE INDEX "_EventTerminatedActors_B_index" ON "_EventTerminatedActors"("B");

-- AddForeignKey
ALTER TABLE "_EventIntroducedActors" ADD CONSTRAINT "_EventIntroducedActors_A_fkey" FOREIGN KEY ("A") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventIntroducedActors" ADD CONSTRAINT "_EventIntroducedActors_B_fkey" FOREIGN KEY ("B") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventTerminatedActors" ADD CONSTRAINT "_EventTerminatedActors_A_fkey" FOREIGN KEY ("A") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventTerminatedActors" ADD CONSTRAINT "_EventTerminatedActors_B_fkey" FOREIGN KEY ("B") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
