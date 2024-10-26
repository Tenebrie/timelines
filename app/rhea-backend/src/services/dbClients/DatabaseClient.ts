import { PrismaClient } from '@prisma/client'

let DatabaseClient: PrismaClient | null = null
export const getPrismaClient = () => {
	if (!DatabaseClient) {
		DatabaseClient = new PrismaClient()
	}
	return DatabaseClient
}
