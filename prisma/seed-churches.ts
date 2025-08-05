import { PrismaClient, ChurchCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function seedChurches() {
  console.log("🌱 Seeding churches...");

  // Create system user for church creation (if not exists)
  let systemUser = await prisma.user.findUnique({
    where: { email: "alexthegoodman@gmail.com" },
  });

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: "system@ourvirtue.org",
        username: "system",
        password: "not-used", // System user doesn't need real password
        isActive: false, // System user is not an active user
        isAdmin: true,
      },
    });
  }

  // Define the 3 initial churches
  const churches = [
    {
      name: "Still Waters",
      description:
        "A peaceful community for parents to connect, share wisdom, and support each other in raising children with virtue and faith. Find encouragement and guidance on your parenting journey.",
      slug: "still-waters",
      category: ChurchCategory.PARENTS,
      creatorId: systemUser.id,
    },
    {
      name: "The New Foundation",
      description:
        "A vibrant community for young people to explore faith, ask questions, and build meaningful connections. Discover your purpose and grow in understanding together with peers.",
      slug: "the-new-foundation",
      category: ChurchCategory.YOUNG_PEOPLE,
      creatorId: systemUser.id,
    },
    {
      name: "Servants of the Harvest",
      description:
        "A community for hardworking individuals who find strength in purpose-driven work. Share experiences, seek guidance, and support each other in balancing work with spiritual growth.",
      slug: "servants-of-the-harvest",
      category: ChurchCategory.WORKERS,
      creatorId: systemUser.id,
    },
  ];

  // Create churches if they don't exist
  for (const churchData of churches) {
    const existingChurch = await prisma.church.findUnique({
      where: { slug: churchData.slug },
    });

    if (!existingChurch) {
      const church = await prisma.church.create({
        data: churchData,
      });

      // Create a getting started post for each church
      await prisma.churchPost.create({
        data: {
          title: "Welcome to " + church.name + "! 🎉",
          content: `## Getting Started

Welcome to our community! We're so glad you're here. Here are a few ways to get started:

### 1. Introduce Yourself
Share a bit about yourself in a new post. Tell us what brought you here and what you're hoping to find in our community.

### 2. Browse and Engage
Look through existing posts and conversations. Feel free to comment, ask questions, and share your thoughts.

### 3. Share Your Story
Don't hesitate to start new discussions about topics that matter to you. Your experiences and insights are valuable to our community.

### 4. Be Respectful
We're all here to grow and learn together. Please be kind, respectful, and considerate in all your interactions.

---

*This is a pinned post to help new members get oriented. Welcome to the community!*`,
          isPinned: true,
          churchId: church.id,
          authorId: systemUser.id,
        },
      });

      console.log(`✅ Created church: ${church.name}`);
    } else {
      console.log(`⏭️  Church already exists: ${churchData.name}`);
    }
  }

  console.log("🎉 Churches seeding completed!");
}

seedChurches()
  .catch((e) => {
    console.error("❌ Error seeding churches:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
