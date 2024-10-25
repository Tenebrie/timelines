import { PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@src/services/dbClients/DatabaseClient'
import { DeepMockProxy, mockReset } from 'jest-mock-extended'

beforeEach(() => {
	mockReset(prismaMock)
})

export const prismaMock = getPrismaClient() as unknown as DeepMockProxy<PrismaClient>
