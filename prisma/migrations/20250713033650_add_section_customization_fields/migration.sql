-- AlterTable
ALTER TABLE "LandingPageSection" ADD COLUMN     "backgroundColor" TEXT,
ADD COLUMN     "borderRadius" TEXT,
ADD COLUMN     "customCSS" TEXT,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "margin" TEXT,
ADD COLUMN     "padding" TEXT,
ADD COLUMN     "textColor" TEXT;

-- AlterTable
ALTER TABLE "LandingPageTemplateSection" ADD COLUMN     "backgroundColor" TEXT,
ADD COLUMN     "borderRadius" TEXT,
ADD COLUMN     "customCSS" TEXT,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "margin" TEXT,
ADD COLUMN     "padding" TEXT,
ADD COLUMN     "textColor" TEXT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "originalPrice" DROP NOT NULL;
