import { DefaultBodyType, rest } from 'msw'
import { SetupServer } from 'msw/lib/node'
import { v4 as getRandomId } from 'uuid'

import {
	CheckAuthenticationApiResponse,
	CreateWorldApiResponse,
	DeleteWorldApiResponse,
	GetWorldsApiResponse,
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
		invocations.push({ jsonBody: req.method === 'POST' ? await req.json() : {} })

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

export const mockAuthenticatedUser = (server: SetupServer) =>
	mockCheckAuthentication(server, {
		response: {
			authenticated: true,
		},
	})

export const mockWorldModel = ({
	id,
	name,
}: {
	id?: string
	name: string
}): GetWorldsApiResponse[number] => ({
	id: id ?? getRandomId(),
	name,
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	ownerId: '1111-2222-3333-4444',
})
