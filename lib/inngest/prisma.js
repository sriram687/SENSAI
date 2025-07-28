import { PrismaClient } from "@prisma/client";

// Create Prisma client with error handling and production optimizations
const createPrismaClient = () => {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Test the connection
    client.$connect().catch((error) => {
      console.error('Failed to connect to database:', error);
    });

    return client;
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    return null;
  }
};

// Use global variable in development to prevent multiple instances
const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    if (db) {
      await db.$disconnect();
    }
  });
}