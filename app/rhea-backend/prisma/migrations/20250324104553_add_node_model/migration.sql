-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,
    "parentActorId" TEXT,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Node_id_key" ON "Node"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Node_parentActorId_key" ON "Node"("parentActorId");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_parentActorId_fkey" FOREIGN KEY ("parentActorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
