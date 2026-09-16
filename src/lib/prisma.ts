import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations
  var prisma: PrismaClient | undefined;
}

// MongoDB Atlas needs no driver adapter — plain client is enough.
export const prisma = global.prisma || new PrismaClient();
export default prisma;

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
