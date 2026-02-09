-- CreateTable
CREATE TABLE "Calendar" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarUnit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "CalendarUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_id_key" ON "Calendar"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarUnit_id_key" ON "CalendarUnit"("id");

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarUnit" ADD CONSTRAINT "CalendarUnit_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarUnit" ADD CONSTRAINT "CalendarUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CalendarUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
