import { DefaultBodyType, rest } from 'msw'
import { SetupServer } from 'msw/node'
import { v4 as getRandomId } from 'uuid'

import { DeepPartial } from '@/app/types/utils'

import { User } from '../app/features/auth/reducer'
import {
	ActorDetails,
	WorldBrief,
	WorldDetails,
	WorldEventDelta,
	WorldItem,
} from '../app/features/worldTimeline/types'
import { WorldEvent } from '../app/features/worldTimeline/types'
import { UpdateActorApiResponse } from './actorListApi'
import { GetAnnouncementsApiResponse } from './announcementListApi'
import { CheckAuthenticationApiResponse, CreateAccountApiResponse, PostLoginApiResponse } from './authApi'
import { ListWorldAccessModesApiResponse } from './otherApi'
import { CollaboratingUser } from './types'
import { GetWorldCollaboratorsApiResponse } from './worldCollaboratorsApi'
import { GetWorldBriefApiResponse, GetWorldInfoApiResponse } from './worldDetailsApi'
import { DeleteWorldEventApiResponse, UpdateWorldEventApiResponse } from './worldEventApi'
import { CreateWorldApiResponse, DeleteWorldApiResponse, GetWorldsApiResponse } from './worldListApi'

type HttpMethod = keyof typeof rest

type MockParams<ResponseT extends DefaultBodyType> =
	| {
			response: ResponseT
	  }
	| {
			error: { status: number; message: string }
	  }

const generateEndpointMock = (
	server: SetupServer,
	{ method, path, ...params }: { method: HttpMethod; path: string } & MockParams<DefaultBodyType>,
) => {
	let invocations: { jsonBody: unknown }[] = []

	const handler = rest[method](path, async (req, res, ctx) => {
		invocations.push({
			jsonBody: req.method === 'POST' || req.method === 'PATCH' ? await req.json() : {},
		})

		const status = (() => {
			if ('error' in params) {
				return params.error.status
			} else if ('response' in params) {
				return 200
			}
			return 204
		})()

		const returnedResponse = (() => {
			if ('error' in params) {
				return params.error
			} else if ('response' in params) {
				return params.response
			}
			return undefined
		})()

		return res(ctx.status(status), ctx.json(returnedResponse))
	})
	server.use(handler)

	return {
		invocations,
		hasBeenCalled: () => invocations.length > 0,
		clearInvocations: () => (invocations = []),
	}
}

/**
 * API call mocks
 */
export const mockCheckAuthentication = (
	server: SetupServer,
	params: MockParams<CheckAuthenticationApiResponse>,
) => generateEndpointMock(server, { method: 'get', path: '/api/auth', ...params })

export const mockGetWorlds = (server: SetupServer, params: MockParams<GetWorldsApiResponse>) =>
	generateEndpointMock(server, { method: 'get', path: '/api/worlds', ...params })

export const mockGetWorldBrief = (
	server: SetupServer,
	params: { worldId: string } & MockParams<GetWorldBriefApiResponse>,
) => generateEndpointMock(server, { method: 'get', path: `/api/world/${params.worldId}/brief`, ...params })

export const mockGetWorldDetails = (
	server: SetupServer,
	params: { worldId: string } & MockParams<GetWorldInfoApiResponse>,
) => generateEndpointMock(server, { method: 'get', path: `/api/world/${params.worldId}`, ...params })

export const mockCreateWorld = (server: SetupServer, params: MockParams<CreateWorldApiResponse>) =>
	generateEndpointMock(server, { method: 'post', path: `/api/worlds`, ...params })

export const mockDeleteWorld = (
	server: SetupServer,
	params: { worldId: string } & MockParams<DeleteWorldApiResponse>,
) => generateEndpointMock(server, { method: 'delete', path: `/api/world/${params.worldId}`, ...params })

export const mockGetWorldCollaborators = (
	server: SetupServer,
	params: { worldId: string } & MockParams<GetWorldCollaboratorsApiResponse>,
) =>
	generateEndpointMock(server, {
		method: 'get',
		path: `/api/world/${params.worldId}/collaborators`,
		...params,
	})

export const mockPostRegister = (server: SetupServer, params: MockParams<CreateAccountApiResponse>) =>
	generateEndpointMock(server, { method: 'post', path: '/api/auth', ...params })

export const mockPostLogin = (server: SetupServer, params: MockParams<PostLoginApiResponse>) =>
	generateEndpointMock(server, { method: 'post', path: '/api/auth/login', ...params })

export const mockUpdateActor = (
	server: SetupServer,
	params: { worldId: string; actorId: string } & MockParams<UpdateActorApiResponse>,
) =>
	generateEndpointMock(server, {
		method: 'patch',
		path: `/api/world/${params.worldId}/actor/${params.actorId}`,
		...params,
	})

export const mockUpdateWorldEvent = (
	server: SetupServer,
	params: { worldId: string; eventId: string } & MockParams<UpdateWorldEventApiResponse>,
) =>
	generateEndpointMock(server, {
		method: 'patch',
		path: `/api/world/${params.worldId}/event/${params.eventId}`,
		...params,
	})

export const mockDeleteWorldEvent = (
	server: SetupServer,
	params: { worldId: string; eventId: string } & MockParams<DeleteWorldEventApiResponse>,
) =>
	generateEndpointMock(server, {
		method: 'delete',
		path: `/api/world/${params.worldId}/event/${params.eventId}`,
		...params,
	})

export const mockAddCollaborator = (server: SetupServer, params: { worldId: string } & MockParams<null>) =>
	generateEndpointMock(server, { method: 'post', path: `/api/world/${params.worldId}/share`, ...params })

export const mockRemoveCollaborator = (
	server: SetupServer,
	params: { worldId: string; userId: string } & MockParams<null>,
) =>
	generateEndpointMock(server, {
		method: 'delete',
		path: `/api/world/${params.worldId}/share/${params.userId}`,
		...params,
	})

export const mockGetAnnouncements = (server: SetupServer, params: MockParams<GetAnnouncementsApiResponse>) =>
	generateEndpointMock(server, {
		method: 'get',
		path: '/api/announcements',
		...params,
	})

export const mockListWorldAccessModes = (
	server: SetupServer,
	params: MockParams<ListWorldAccessModesApiResponse>,
) => generateEndpointMock(server, { method: 'get', path: '/api/constants/world-access-modes', ...params })

/**
 * Mock utility functions
 */
export const mockAuthenticatedUser = (server: SetupServer) =>
	mockCheckAuthentication(server, {
		response: {
			authenticated: true,
			sessionId: 'test-session-id',
			user: {
				id: '1111-2222-3333',
				email: 'admin@localhost',
				username: 'admin',
				level: 'Admin',
			},
		},
	})

export const mockNonAuthenticatedUser = (server: SetupServer) =>
	mockCheckAuthentication(server, {
		response: {
			authenticated: false,
			sessionId: 'test-session-id',
		},
	})

/**
 * Mock API models
 */
export const mockUserModel = (user: Partial<User> = {}): User => ({
	id: getRandomId(),
	email: 'user@localhost',
	username: 'User',
	level: 'Free',
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
