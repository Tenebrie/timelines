import { DefaultBodyType, rest } from 'msw'
import { SetupServer } from 'msw/lib/node'
import { v4 as getRandomId } from 'uuid'

import { WorldDetails, WorldItem, WorldStatement } from '../app/features/world/types'
import { WorldEvent } from '../app/features/world/types'
import {
	CheckAuthenticationApiResponse,
	CreateWorldApiResponse,
	DeleteWorldApiResponse,
	DeleteWorldEventApiResponse,
	DeleteWorldStatementApiResponse,
	GetWorldsApiResponse,
	UpdateWorldEventApiResponse,
	UpdateWorldStatementApiResponse,
} from './rheaApi'

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
	{ method, path, ...params }: { method: HttpMethod; path: string } & MockParams<DefaultBodyType>
) => {
	let invocations: { jsonBody: any }[] = []

	const handler = rest[method](path, async (req, res, ctx) => {
		invocations.push({ jsonBody: req.method === 'POST' || req.method === 'PATCH' ? await req.json() : {} })

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
	params: MockParams<CheckAuthenticationApiResponse>
) => generateEndpointMock(server, { method: 'get', path: '/api/auth', ...params })

export const mockGetWorlds = (server: SetupServer, params: MockParams<GetWorldsApiResponse>) =>
	generateEndpointMock(server, { method: 'get', path: '/api/worlds', ...params })

export const mockCreateWorld = (server: SetupServer, params: MockParams<CreateWorldApiResponse>) =>
	generateEndpointMock(server, { method: 'post', path: `/api/world`, ...params })

export const mockDeleteWorld = (
	server: SetupServer,
	params: { worldId: string } & MockParams<DeleteWorldApiResponse>
) => generateEndpointMock(server, { method: 'delete', path: `/api/world/${params.worldId}`, ...params })

export const mockPostLogin = (server: SetupServer, params: MockParams<undefined> = { response: undefined }) =>
	generateEndpointMock(server, { method: 'post', path: '/api/auth/login', ...params })

export const mockUpdateWorldEvent = (
	server: SetupServer,
	params: { worldId: string; eventId: string } & MockParams<UpdateWorldEventApiResponse>
) =>
	generateEndpointMock(server, {
		method: 'patch',
		path: `/api/world/${params.worldId}/event/${params.eventId}`,
		...params,
	})

export const mockDeleteWorldEvent = (
	server: SetupServer,
	params: { worldId: string; eventId: string } & MockParams<DeleteWorldEventApiResponse>
) =>
	generateEndpointMock(server, {
		method: 'delete',
		path: `/api/world/${params.worldId}/event/${params.eventId}`,
		...params,
	})

export const mockUpdateWorldStatement = (
	server: SetupServer,
	params: { worldId: string; statementId: string } & MockParams<UpdateWorldStatementApiResponse>
) =>
	generateEndpointMock(server, {
		method: 'patch',
		path: `/api/world/${params.worldId}/statement/${params.statementId}`,
		...params,
	})

export const mockDeleteWorldStatement = (
	server: SetupServer,
	params: { worldId: string; statementId: string } & MockParams<DeleteWorldStatementApiResponse>
) =>
	generateEndpointMock(server, {
		method: 'delete',
		path: `/api/world/${params.worldId}/statement/${params.statementId}`,
		...params,
	})

/**
 * Mock utility functions
 */
export const mockAuthenticatedUser = (server: SetupServer) =>
	mockCheckAuthentication(server, {
		response: {
			authenticated: true,
		},
	})

export const mockNonAuthenticatedUser = (server: SetupServer) =>
	mockCheckAuthentication(server, {
		response: {
			authenticated: false,
		},
	})

/**
 * Mock API models
 */
export const mockWorldItemModel = (world: Partial<WorldItem> = {}): WorldItem => ({
	id: getRandomId(),
	name: 'World name',
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	ownerId: '1111-2222-3333-4444',
	...world,
})

export const mockWorldDetailsModel = (world: Partial<WorldDetails> = {}): WorldDetails => ({
	id: getRandomId(),
	name: 'World name',
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	ownerId: '1111-2222-3333-4444',
	events: [],
	...world,
})

export const mockEventModel = (statement: Partial<WorldEvent> = {}): WorldEvent => ({
	id: getRandomId(),
	worldId: 'world-1111-2222-3333-4444',
	name: 'Event name',
	description: 'Event description',
	type: 'SCENE',
	icon: 'default',
	timestamp: 0,
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	issuedStatements: [],
	revokedStatements: [],
	...statement,
})

export const mockStatementModel = (statement: Partial<WorldStatement> = {}): WorldStatement => ({
	id: getRandomId(),
	title: 'Statement title',
	text: 'Statement text',
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	issuedByEventId: 'event-1111-2222-3333-4444',
	...statement,
})