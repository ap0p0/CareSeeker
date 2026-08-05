-- AlterTable: move age off users root profile into seekers_info
ALTER TABLE "seekers_info" ADD COLUMN "age" INTEGER;

-- DropIndex
DROP INDEX IF EXISTS "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username";
ALTER TABLE "User" DROP COLUMN "age";

-- RenameTable
ALTER TABLE "User" RENAME TO "users";
