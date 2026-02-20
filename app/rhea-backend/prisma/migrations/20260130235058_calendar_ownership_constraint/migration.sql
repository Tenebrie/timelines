-- AlterTable
ALTER TABLE "Calendar" ALTER COLUMN "ownerId" DROP NOT NULL;

ALTER TABLE "Calendar" ADD CONSTRAINT "calendar_owner_xor_world" 
CHECK (
  (("worldId" IS NOT NULL)::int + ("ownerId" IS NOT NULL)::int) = 1
);
