-- CreateTable
CREATE TABLE "_WikiMentionedTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WikiMentionedTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_WikiMentionedTags_B_index" ON "_WikiMentionedTags"("B");

-- AddForeignKey
ALTER TABLE "_WikiMentionedTags" ADD CONSTRAINT "_WikiMentionedTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WikiMentionedTags" ADD CONSTRAINT "_WikiMentionedTags_B_fkey" FOREIGN KEY ("B") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
