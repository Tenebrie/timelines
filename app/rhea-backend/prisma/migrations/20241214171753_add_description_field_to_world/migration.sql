-- AlterTable
ALTER TABLE "World" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "_EventIntroducedActors" ADD CONSTRAINT "_EventIntroducedActors_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventIntroducedActors_AB_unique";

-- AlterTable
ALTER TABLE "_EventMentionedActors" ADD CONSTRAINT "_EventMentionedActors_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventMentionedActors_AB_unique";

-- AlterTable
ALTER TABLE "_EventTargetActors" ADD CONSTRAINT "_EventTargetActors_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventTargetActors_AB_unique";

-- AlterTable
ALTER TABLE "_EventTerminatedActors" ADD CONSTRAINT "_EventTerminatedActors_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventTerminatedActors_AB_unique";
