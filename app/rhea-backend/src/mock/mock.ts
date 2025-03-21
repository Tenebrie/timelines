import { CollaboratingUser, User, World } from '@prisma/client'

export const mockUser = (data?: Partial<User>): User => ({
	id: 'user-1111',
	email: 'admin@localhost',
	level: 'Free',
	username: 'admin',
	password: 'qwerty1234',
	createdAt: new Date(0),
	updatedAt: new Date(0),
	bio: 'bio',
	avatarId: 'avatar-1111',
	...data,
})

export const mockWorld = (data?: Partial<World>): World => ({
	id: 'world-1111',
	name: 'Test World',
	description: 'Test World Description',
	ownerId: 'undefined-user-1111',
	calendar: 'EARTH',
	timeOrigin: BigInt(100),
	accessMode: 'Private',
	createdAt: new Date(0),
	updatedAt: new Date(0),
	...data,
})

export const mockCollaboratingUser = (data?: Partial<CollaboratingUser>): CollaboratingUser => ({
	userId: 'unknown-user-1111',
	worldId: 'unknown-world-1111',
	access: 'Editing',
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
