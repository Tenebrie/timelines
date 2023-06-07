/*
  Warnings:

  - You are about to drop the `ActorStatement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ActorToActorStatement` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[replacedStatementId]` on the table `WorldStatement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[replacedByStatementId]` on the table `WorldStatement` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ActorStatement" DROP CONSTRAINT "ActorStatement_issuedByEventId_fkey";

-- DropForeignKey
ALTER TABLE "ActorStatement" DROP CONSTRAINT "ActorStatement_replacedStatementId_fkey";

-- DropForeignKey
ALTER TABLE "ActorStatement" DROP CONSTRAINT "ActorStatement_revokedByEventId_fkey";

-- DropForeignKey
ALTER TABLE "_ActorToActorStatement" DROP CONSTRAINT "_ActorToActorStatement_A_fkey";

-- DropForeignKey
ALTER TABLE "_ActorToActorStatement" DROP CONSTRAINT "_ActorToActorStatement_B_fkey";

-- AlterTable
ALTER TABLE "WorldStatement" ADD COLUMN     "replacedByStatementId" TEXT,
ADD COLUMN     "replacedStatementId" TEXT;

-- DropTable
DROP TABLE "ActorStatement";

-- DropTable
DROP TABLE "_ActorToActorStatement";

-- CreateTable
CREATE TABLE "_ActorToWorldStatement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ActorToWorldStatement_AB_unique" ON "_ActorToWorldStatement"("A", "B");

-- CreateIndex
CREATE INDEX "_ActorToWorldStatement_B_index" ON "_ActorToWorldStatement"("B");

-- CreateIndex
CREATE UNIQUE INDEX "WorldStatement_replacedStatementId_key" ON "WorldStatement"("replacedStatementId");

-- CreateIndex
CREATE UNIQUE INDEX "WorldStatement_replacedByStatementId_key" ON "WorldStatement"("replacedByStatementId");

-- AddForeignKey
ALTER TABLE "WorldStatement" ADD CONSTRAINT "WorldStatement_replacedStatementId_fkey" FOREIGN KEY ("replacedStatementId") REFERENCES "WorldStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActorToWorldStatement" ADD CONSTRAINT "_ActorToWorldStatement_A_fkey" FOREIGN KEY ("A") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActorToWorldStatement" ADD CONSTRAINT "_ActorToWorldStatement_B_fkey" FOREIGN KEY ("B") REFERENCES "WorldStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
