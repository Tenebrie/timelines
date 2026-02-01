import { v4 as getRandomId } from 'uuid'

import { DeepPartial } from '@/app/utils/DeepPartial'

import { User } from '../../app/features/auth/AuthSlice'
import { CollaboratingUser } from '../types/worldCollaboratorsTypes'
import { ActorDetails, WorldBrief, WorldDetails, WorldEventDelta, WorldItem } from '../types/worldTypes'
import { WorldEvent } from '../types/worldTypes'
import { GetWorldInfoApiResponse } from '../worldDetailsApi'

export const mockUserModel = (user: Partial<User> = {}): User => ({
	id: getRandomId(),
	email: 'user@localhost',
	username: 'User',
	level: 'Free',
	bio: 'My detailed bio',
	avatarUrl: 'https://http.cat/images/404.jpg',
	...user,
})

export const mockCollaboratingUser = (data: DeepPartial<CollaboratingUser> = {}): CollaboratingUser => ({
	access: 'Editing',
	worldId: 'world-1111',
	...data,
	user: {
		id: 'user-1111',
		email: 'user@localhost',
		...data?.user,
	},
})

export const mockWorldItemModel = (world: Partial<WorldItem> = {}): WorldItem => ({
	id: getRandomId(),
	name: 'World name',
	description: 'World description',
	calendar: 'EARTH',
	timeOrigin: '0',
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	ownerId: '1111-2222-3333-4444',
	collaborators: [],
	accessMode: 'Private',
	calendars: [],
	...world,
})

export const mockWorldBriefModel = (world: Partial<WorldBrief> = {}): WorldBrief => ({
	...mockWorldItemModel(),
	...world,
})

export const mockWorldDetailsModel = (world: Partial<WorldDetails> = {}): WorldDetails => ({
	...mockWorldItemModel(),
	events: [],
	actors: [],
	isReadOnly: false,
	...world,
})

export const mockActorModel = (actor: Partial<ActorDetails> = {}): ActorDetails => ({
	id: getRandomId(),
	worldId: 'world-1111-2222-3333-4444',
	name: 'Actor name',
	title: 'Actor title',
	description: 'Actor description',
	descriptionRich: 'Actor description',
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	mentions: [],
	mentionedIn: [],
	icon: 'default',
	color: '#008080',
	...actor,
})

export const mockEventModel = (statement: Partial<WorldEvent> = {}): WorldEvent => ({
	id: getRandomId(),
	worldId: 'world-1111-2222-3333-4444',
	name: 'Event name',
	description: 'Event description',
	descriptionRich: '<p>Event description</p>',
	type: 'SCENE',
	icon: 'default',
	timestamp: 0,
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	mentions: [],
	mentionedIn: [],
	extraFields: [],
	customName: false,
	deltaStates: [],
	externalLink: '',
	worldEventTrackId: null,
	color: '#008080',
	...statement,
})

export const mockEventDeltaModel = (
	provided: Partial<WorldEventDelta> & Pick<WorldEventDelta, 'worldEventId'>,
): WorldEventDelta => ({
	id: getRandomId(),
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	timestamp: 0,
	name: 'Delta name',
	description: 'Delta description',
	descriptionRich: '<p>Delta description</p>',
	...provided,
})

export const mockApiWorldDetailsModel = (
	world: Partial<GetWorldInfoApiResponse> = {},
): GetWorldInfoApiResponse => ({
	id: getRandomId(),
	name: 'World name',
	description: 'World description',
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	actors: [],
	events: [],
	calendar: 'EARTH',
	ownerId: 'user-1111',
	timeOrigin: '0',
	accessMode: 'Private',
	isReadOnly: false,
	calendars: [],
	...world,
})

export const mockApiEventModel = (
	statement: Partial<GetWorldInfoApiResponse['events'][number]> = {},
): GetWorldInfoApiResponse['events'][number] => ({
	id: getRandomId(),
	worldId: 'world-1111-2222-3333-4444',
	name: 'Event name',
	description: 'Event description',
	descriptionRich: '<p>Event description</p>',
	type: 'SCENE',
	icon: 'default',
	timestamp: '0',
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	mentions: [],
	mentionedIn: [],
	extraFields: [],
	customName: false,
	deltaStates: [],
	revokedAt: null,
	externalLink: '',
	worldEventTrackId: null,
	color: '#008080',
	...statement,
})
