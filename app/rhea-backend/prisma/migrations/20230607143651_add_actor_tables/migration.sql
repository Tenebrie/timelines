-- CreateTable
CREATE TABLE "Actor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Actor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActorStatement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "issuedByEventId" TEXT NOT NULL,
    "revokedByEventId" TEXT,
    "replacedStatementId" TEXT,
    "replacedByStatementId" TEXT,

    CONSTRAINT "ActorStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActorRelationship" (
    "originId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ActorRelationship_pkey" PRIMARY KEY ("originId","receiverId")
);

-- CreateTable
CREATE TABLE "_ActorToActorStatement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Actor_id_key" ON "Actor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ActorStatement_id_key" ON "ActorStatement"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ActorStatement_replacedStatementId_key" ON "ActorStatement"("replacedStatementId");

-- CreateIndex
CREATE UNIQUE INDEX "ActorStatement_replacedByStatementId_key" ON "ActorStatement"("replacedByStatementId");

-- CreateIndex
CREATE UNIQUE INDEX "_ActorToActorStatement_AB_unique" ON "_ActorToActorStatement"("A", "B");

-- CreateIndex
CREATE INDEX "_ActorToActorStatement_B_index" ON "_ActorToActorStatement"("B");

-- AddForeignKey
ALTER TABLE "ActorStatement" ADD CONSTRAINT "ActorStatement_issuedByEventId_fkey" FOREIGN KEY ("issuedByEventId") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActorStatement" ADD CONSTRAINT "ActorStatement_revokedByEventId_fkey" FOREIGN KEY ("revokedByEventId") REFERENCES "WorldEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActorStatement" ADD CONSTRAINT "ActorStatement_replacedStatementId_fkey" FOREIGN KEY ("replacedStatementId") REFERENCES "ActorStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActorRelationship" ADD CONSTRAINT "ActorRelationship_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActorRelationship" ADD CONSTRAINT "ActorRelationship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActorToActorStatement" ADD CONSTRAINT "_ActorToActorStatement_A_fkey" FOREIGN KEY ("A") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActorToActorStatement" ADD CONSTRAINT "_ActorToActorStatement_B_fkey" FOREIGN KEY ("B") REFERENCES "ActorStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
