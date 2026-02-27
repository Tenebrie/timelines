/*
  Warnings:

  - The values [Image] on the enum `AssetType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssetType_new" AS ENUM ('ImageConversion', 'Avatar');
ALTER TABLE "Asset" ALTER COLUMN "contentType" TYPE "AssetType_new" USING ("contentType"::text::"AssetType_new");
ALTER TYPE "AssetType" RENAME TO "AssetType_old";
ALTER TYPE "AssetType_new" RENAME TO "AssetType";
DROP TYPE "public"."AssetType_old";
COMMIT;
