import { Prisma, PrismaClient } from '@prisma/client'

let DatabaseClient: PrismaClient | null = null

export function getPrismaClient(): PrismaClient
export function getPrismaClient(transactionClient?: Prisma.TransactionClient): Prisma.TransactionClient
export function getPrismaClient(
	transactionClient?: Prisma.TransactionClient,
): PrismaClient | Prisma.TransactionClient {
	if (transactionClient) {
		return transactionClient
	}
	if (!DatabaseClient) {
		DatabaseClient = new PrismaClient()
	}
	return DatabaseClient
}
