/*
  Warnings:

  - The primary key for the `Mention` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Mention` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sourceId,targetId]` on the table `Mention` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceId` to the `Mention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetId` to the `Mention` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Mention_sourceActorId_sourceEventId_sourceArticleId_sourceT_key";

-- AlterTable
ALTER TABLE "Mention" DROP CONSTRAINT "Mention_pkey",
DROP COLUMN "id",
ADD COLUMN     "sourceId" TEXT NOT NULL,
ADD COLUMN     "targetId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Mention_sourceId_targetId_key" ON "Mention"("sourceId", "targetId");
