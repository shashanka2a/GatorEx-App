import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client
function createPrismaClient() {
  let databaseUrl = process.env.DATABASE_URL;
  
  // Handle Turso URLs by converting them to the format Prisma expects
  if (databaseUrl?.startsWith('libsql://')) {
    // For development/testing, we'll use a local SQLite file
    // In production, the runtime will handle the Turso connection
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('🔧 Using local SQLite for development/testing');
      databaseUrl = 'file:./dev.db';
    } else {
      // In production, we need to handle this differently
      // For now, let's create the tables manually and use a local file for Prisma
      databaseUrl = 'file:./prod.db';
    }
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  return client;
}

// Use global variable in development to prevent multiple instances
const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

export { prisma };
export default prisma;