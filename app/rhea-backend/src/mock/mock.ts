import { User, World } from '@prisma/client'

export const mockUser = (data?: Partial<User>): User => ({
	id: 'user-1111',
	email: 'admin@localhost',
	level: 'Free',
	username: 'admin',
	password: 'qwerty1234',
	...data,
})

export const mockWorld = (data?: Partial<World>): World => ({
	id: 'world-1111',
	name: 'Test World',
	ownerId: 'undefined-user-1111',
	calendar: 'COUNTUP',
	timeOrigin: BigInt(100),
	accessMode: 'Private',
	createdAt: new Date(0),
	updatedAt: new Date(0),
	...data,
})

export const mockToResponse = <T extends World | User>(data: T) => {
	return {
		...data,
		timeOrigin: 'timeOrigin' in data ? data.timeOrigin.toString() : undefined,
		createdAt: 'createdAt' in data ? data.createdAt.toISOString() : undefined,
		updatedAt: 'updatedAt' in data ? data.updatedAt.toISOString() : undefined,
	}
}
