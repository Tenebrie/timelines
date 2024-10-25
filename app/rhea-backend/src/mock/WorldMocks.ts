import { World } from '@prisma/client'

export const mockWorld = (data?: Partial<World>): World => ({
	id: 'world-1111',
	name: 'Test World',
	ownerId: 'user-1111',
	calendar: 'COUNTUP',
	timeOrigin: BigInt(100),
	accessMode: 'Private',
	createdAt: new Date(0),
	updatedAt: new Date(0),
	...data,
})
