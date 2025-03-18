import { CollaboratingUser, World } from '@prisma/client'
import { vi } from 'vitest'

export const prismaMockRef = {
	current: makePrismaClient({}),
}

function makePrismaClient({
	worldCount,
	world,
	collaboratingUser,
}: {
	worldCount?: number
	world?: World
	collaboratingUser?: CollaboratingUser
}) {
	return {
		world: {
			count: vi.fn().mockResolvedValue(worldCount),
			findFirst: vi.fn().mockResolvedValue(world),
			findFirstOrThrow: vi.fn().mockResolvedValue(world),
		},
		collaboratingUser: {
			findFirst: vi.fn().mockResolvedValue(collaboratingUser),
			findFirstOrThrow: vi.fn().mockResolvedValue(collaboratingUser),
		},
	}
}

export function mockPrismaClient({
	world,
	collaboratingUser,
}: {
	world?: World
	collaboratingUser?: CollaboratingUser
}) {
	prismaMockRef.current = makePrismaClient({ world, collaboratingUser })
}

beforeEach(() => {
	prismaMockRef.current = makePrismaClient({})
})
// export const prismaMock = getPrismaClient() as unknown as DeepMockProxy<PrismaClient>
