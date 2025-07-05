
import { PrismaClient } from "@prisma/client";

export default async function seedLandingPageTemplates(prisma: PrismaClient) {
  await prisma.landingPageTemplate.create({
    data: {
      name: "Modern Hero Template",
      description: "Clean and modern template with hero section, features, and CTA",
      thumbnail: "/placeholder.svg",
      isDefault: true,
      sections: {
        create: [
          {
            type: "HERO",
            title: "Hero Section",
            content: "Main headline and description",
            image: "/placeholder.svg",
            settings: { bgColor: "white" },
            order: 1,
          },
        ],
      },
    },
  });
}
