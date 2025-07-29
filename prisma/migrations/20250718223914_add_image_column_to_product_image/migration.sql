/*
  Warnings:

  - You are about to drop the column `data` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `ProductImage` table. All the data in the column will be lost.
  - Added the required column `image` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "data",
DROP COLUMN "url",
ADD COLUMN     "image" BYTEA NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL;
