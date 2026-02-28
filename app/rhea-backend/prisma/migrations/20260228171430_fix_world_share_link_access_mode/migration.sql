/*
  Warnings:

  - Changed the type of `accessMode` on the `WorldShareLink` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "WorldShareLink" DROP COLUMN "accessMode",
ADD COLUMN     "accessMode" "CollaboratorAccess" NOT NULL;
