-- DropForeignKey
ALTER TABLE "LandingPage" DROP CONSTRAINT "LandingPage_templateId_fkey";

-- AlterTable
ALTER TABLE "LandingPage" ALTER COLUMN "templateId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT 'singleton',
ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- AddForeignKey
ALTER TABLE "LandingPage" ADD CONSTRAINT "LandingPage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LandingPageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
