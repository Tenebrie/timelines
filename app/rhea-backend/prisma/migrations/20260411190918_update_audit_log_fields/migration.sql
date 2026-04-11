/*
  Warnings:

  - The values [GuestAccountCreated] on the enum `AuditAction` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `AuditLog` table. All the data in the column will be lost.
  - Added the required column `data` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuditAction_new" AS ENUM ('UserCreateAccount', 'UserLoginWithPassword', 'UserLoginWithGoogle', 'UserLoginFailed', 'UserDeleteAccount', 'GuestCreateAccount', 'AdminImpersonateUser', 'AdminUpdateUser', 'AdminSetUserLevel', 'AdminSetUserPassword', 'AdminDeleteUser');
ALTER TABLE "AuditLog" ALTER COLUMN "action" TYPE "AuditAction_new" USING ("action"::text::"AuditAction_new");
ALTER TYPE "AuditAction" RENAME TO "AuditAction_old";
ALTER TYPE "AuditAction_new" RENAME TO "AuditAction";
DROP TYPE "public"."AuditAction_old";
COMMIT;

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "description",
ADD COLUMN     "data" JSONB NOT NULL;
