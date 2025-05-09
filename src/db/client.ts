import { PrismaClient } from "../../prisma/generated";
import { DATABASE_URL } from "../config/config";

export const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});
