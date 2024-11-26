/*
  Warnings:

  - You are about to drop the column `isBottle` on the `WasteCollection` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `WasteCollection` table. All the data in the column will be lost.
  - Added the required column `label` to the `WasteCollection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WasteCollection" DROP COLUMN "isBottle",
DROP COLUMN "quantity",
ADD COLUMN     "label" TEXT NOT NULL;
