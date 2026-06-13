import "dotenv/config";

import { createPrismaClient } from "../lib/db/create-prisma-client";

const prisma = createPrismaClient();

async function main() {
  const now = new Date("2026-06-12T12:00:00.000Z");

  await prisma.entry.upsert({
    where: {
      collection_slug: {
        collection: "blog",
        slug: "hello-world",
      },
    },
    update: {},
    create: {
      slug: "hello-world",
      title: "Hello World",
      body: "<p>Welcome to the blog. This is a seeded example entry.</p>",
      collection: "blog",
      status: "published",
      publishedAt: now,
    },
  });

  await prisma.entry.upsert({
    where: {
      collection_slug: {
        collection: "leaves",
        slug: "first-leaf",
      },
    },
    update: {},
    create: {
      slug: "first-leaf",
      title: "First Leaf",
      body: "<p>A small note for the Little Library. Another seeded example.</p>",
      collection: "leaves",
      status: "published",
      publishedAt: new Date("2026-05-01T12:00:00.000Z"),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
