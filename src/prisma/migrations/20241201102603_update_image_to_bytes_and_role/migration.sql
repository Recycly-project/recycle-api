/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - The `ktp` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `image` on the `WasteCollection` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "ktp",
ADD COLUMN     "ktp" BYTEA;

-- AlterTable
ALTER TABLE "WasteCollection" DROP COLUMN "image",
ADD COLUMN     "image" BYTEA NOT NULL;
