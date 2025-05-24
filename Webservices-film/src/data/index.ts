import { PrismaClient } from '@prisma/client'; // 👈 1
import { getLogger } from '../core/logging';

export const prisma = new PrismaClient(); // 👈 1

// 👇 2
export async function initializeData(): Promise<void> {
  getLogger().info('Initializing connection to the database');

  await prisma.$connect();

  getLogger().info('Successfully connected to the database');
}

// 👇 3
export async function shutdownData(): Promise<void> {
  getLogger().info('Shutting down database connection');

  await prisma?.$disconnect();

  getLogger().info('Database connection closed');
}
