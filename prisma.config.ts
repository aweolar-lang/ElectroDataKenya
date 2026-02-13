import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
  // Add this block to tell Prisma how to run the seed file
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});