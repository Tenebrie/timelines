-- CreateTable
CREATE TABLE "_worldCollaborator" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_worldCollaborator_AB_unique" ON "_worldCollaborator"("A", "B");

-- CreateIndex
CREATE INDEX "_worldCollaborator_B_index" ON "_worldCollaborator"("B");

-- AddForeignKey
ALTER TABLE "_worldCollaborator" ADD CONSTRAINT "_worldCollaborator_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_worldCollaborator" ADD CONSTRAINT "_worldCollaborator_B_fkey" FOREIGN KEY ("B") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
