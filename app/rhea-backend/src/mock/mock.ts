import { CollaboratingUser, User, World } from '@prisma/client'
import { BaselineActor, BaselineArticle, BaselineTag, BaselineWorldEvent } from '@src/services/types.js'
import { randomUUID } from 'crypto'

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
	deletedAt: null,
	deletionScheduledAt: null,
	...data,
})

export const mockWorld = (data?: Partial<World>): World => ({
	id: 'world-1111',
	name: 'Test World',
	description: 'Test World Description',
	ownerId: 'undefined-user-1111',
	calendar: null,
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

export const mockActor = (data?: Partial<BaselineActor>): BaselineActor => ({
	id: randomUUID(),
	createdAt: new Date(0),
	updatedAt: new Date(0),
	worldId: 'world-1111',
	name: 'Test Actor',
	title: 'Test Actor Title',
	icon: 'mui:person',
	color: '#000',
	pages: [],
	mentions: [],
	node: null,
	description: 'Test Actor Description',
	descriptionRich: '<p>Test Actor Description</p>',
	mentionedIn: [],
	...data,
})

export const mockWikiArticle = (data?: Partial<BaselineArticle>): BaselineArticle => ({
	id: randomUUID(),
	createdAt: new Date(0),
	updatedAt: new Date(0),
	worldId: 'world-1111',
	name: 'Test Article',
	icon: 'mui:leaf',
	color: '#000',
	position: 0,
	parentId: null,
	contentRich: 'Test Article Content',
	...data,
})

export const mockWorldEvent = (data?: Partial<BaselineWorldEvent>): BaselineWorldEvent => ({
	id: randomUUID(),
	createdAt: new Date(0),
	updatedAt: new Date(0),
	worldId: 'world-1111',
	name: 'Test Event',
	icon: 'mui:event',
	color: '#000',
	timestamp: BigInt(0),
	revokedAt: null,
	worldEventTrackId: null,
	description: 'Test Event Description',
	descriptionRich: '<p>Test Event Description</p>',
	pages: [],
	mentions: [],
	mentionedIn: [],
	deltaStates: [],
	...data,
})

export const mockTag = (data?: Partial<BaselineTag>): BaselineTag => ({
	id: randomUUID(),
	createdAt: new Date(0),
	updatedAt: new Date(0),
	worldId: 'world-1111',
	name: 'Test Tag',
	description: 'Tag description',
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
