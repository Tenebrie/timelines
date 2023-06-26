-- CreateEnum
CREATE TYPE "WorldEventField" AS ENUM ('REVOKED_AT', 'CUSTOM_NAME', 'EVENT_ICON', 'TARGET_ACTORS', 'MENTIONED_ACTORS');

-- AlterTable
ALTER TABLE "WorldEvent" ADD COLUMN     "extraFields" "WorldEventField"[];
