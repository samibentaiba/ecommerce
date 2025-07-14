/*
  Warnings:

  - You are about to drop the column `customerEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `OrderRequest` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customerPhone` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderRequest" DROP CONSTRAINT "OrderRequest_productId_fkey";

-- DropForeignKey
ALTER TABLE "OrderRequest" DROP CONSTRAINT "OrderRequest_variantId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customerEmail",
ADD COLUMN     "customerPhone" TEXT NOT NULL;

-- DropTable
DROP TABLE "OrderRequest";

-- DropEnum
DROP TYPE "OrderRequestStatus";
