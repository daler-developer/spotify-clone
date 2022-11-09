/*
  Warnings:

  - You are about to drop the column `userId` on the `albums` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "albums" DROP CONSTRAINT "albums_userId_fkey";

-- AlterTable
ALTER TABLE "albums" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
