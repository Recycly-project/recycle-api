/*
  Warnings:

  - Added the required column `image` to the `WasteCollection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WasteCollection" ADD COLUMN     "image" VARCHAR NOT NULL;
