// for azure postgres compatibility
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// for neon compatibility
// import { PrismaClient } from "../lib/generated/prisma/client";
// import { PrismaNeon } from "@prisma/adapter-neon";
// import dotenv from "dotenv";

// dotenv.config({ quiet: true });
// const connectionString = `${process.env.DATABASE_URL}`;
// const adapter = new PrismaNeon({ connectionString });

// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
