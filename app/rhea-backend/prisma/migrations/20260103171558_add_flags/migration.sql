-- CreateEnum
CREATE TYPE "FlagValue" AS ENUM ('DatabaseSeeded', 'FirstUserLoggedIn');

-- CreateTable
CREATE TABLE "Flags" (
    "value" "FlagValue" NOT NULL,

    CONSTRAINT "Flags_pkey" PRIMARY KEY ("value")
);
