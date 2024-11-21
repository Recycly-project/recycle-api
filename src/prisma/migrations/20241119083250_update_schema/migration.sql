/*
  Warnings:

  - The primary key for the `Redeem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `pointId` on the `Redeem` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Redeem` table. All the data in the column will be lost.
  - The primary key for the `Reward` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `redeemId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - The primary key for the `WasteCollection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `pointId` on the `WasteCollection` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `WasteCollection` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `WasteCollection` table. All the data in the column will be lost.
  - You are about to drop the column `wasteId` on the `WasteCollection` table. All the data in the column will be lost.
  - You are about to drop the `Point` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `Redeem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `WasteCollection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pointsUsed` to the `Redeem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardId` to the `Redeem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userld` to the `Redeem` table without a default value. This is not possible if the table is not empty.
  - Made the column `fullName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `isBottle` to the `WasteCollection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `points` to the `WasteCollection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userld` to the `WasteCollection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Point" DROP CONSTRAINT "Point_userId_fkey";

-- DropForeignKey
ALTER TABLE "Redeem" DROP CONSTRAINT "Redeem_pointId_fkey";

-- DropForeignKey
ALTER TABLE "Redeem" DROP CONSTRAINT "Redeem_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_redeemId_fkey";

-- DropForeignKey
ALTER TABLE "WasteCollection" DROP CONSTRAINT "WasteCollection_pointId_fkey";

-- DropForeignKey
ALTER TABLE "WasteCollection" DROP CONSTRAINT "WasteCollection_userId_fkey";

-- DropIndex
DROP INDEX "Reward_redeemId_key";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Redeem" DROP CONSTRAINT "Redeem_pkey",
DROP COLUMN "pointId",
DROP COLUMN "userId",
ADD COLUMN     "pointsUsed" INTEGER NOT NULL,
ADD COLUMN     "rewardId" TEXT NOT NULL,
ADD COLUMN     "userld" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Redeem_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Redeem_id_seq";

-- AlterTable
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_pkey",
DROP COLUMN "redeemId",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "title" SET DATA TYPE VARCHAR,
ALTER COLUMN "description" SET DATA TYPE VARCHAR,
ADD CONSTRAINT "Reward_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Reward_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username",
ADD COLUMN     "role" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalPoints" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "password" SET DATA TYPE VARCHAR,
ALTER COLUMN "fullName" SET NOT NULL,
ALTER COLUMN "fullName" SET DATA TYPE VARCHAR,
ALTER COLUMN "address" SET DATA TYPE VARCHAR,
ALTER COLUMN "ktp" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "WasteCollection" DROP CONSTRAINT "WasteCollection_pkey",
DROP COLUMN "pointId",
DROP COLUMN "type",
DROP COLUMN "userId",
DROP COLUMN "wasteId",
ADD COLUMN     "isBottle" BOOLEAN NOT NULL,
ADD COLUMN     "points" INTEGER NOT NULL,
ADD COLUMN     "userld" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "bottleCode" SET DATA TYPE TEXT,
ADD CONSTRAINT "WasteCollection_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "WasteCollection_id_seq";

-- DropTable
DROP TABLE "Point";

-- CreateIndex
CREATE UNIQUE INDEX "Redeem_id_key" ON "Redeem"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_id_key" ON "Reward"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WasteCollection_id_key" ON "WasteCollection"("id");

-- AddForeignKey
ALTER TABLE "WasteCollection" ADD CONSTRAINT "WasteCollection_userld_fkey" FOREIGN KEY ("userld") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redeem" ADD CONSTRAINT "Redeem_userld_fkey" FOREIGN KEY ("userld") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redeem" ADD CONSTRAINT "Redeem_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
