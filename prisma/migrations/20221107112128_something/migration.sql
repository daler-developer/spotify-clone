-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('RU', 'EN');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lang" "Lang" NOT NULL DEFAULT 'EN',
ADD COLUMN     "theme" "Theme" NOT NULL DEFAULT 'LIGHT';
