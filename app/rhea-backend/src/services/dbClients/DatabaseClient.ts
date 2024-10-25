import { PrismaClient } from '@prisma/client'

export const DatabaseClient = new PrismaClient()
export const dbClient = DatabaseClient
