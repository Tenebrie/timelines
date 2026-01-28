import { IMPERSONATED_USER_HEADER, SERVICE_AUTH_TOKEN_HEADER } from '@src/ts-shared/const/constants.js'
import createClient from 'openapi-fetch'

import type { paths } from '../api/rhea-api.js'
import { TokenService } from './TokenService.js'
import { DocumentMetadata } from './YjsSyncService.js'

const rheaClient = createClient<paths>({
	baseUrl: 'http://rhea:3000',
})

type PermissionLevel =
	keyof paths['/api/internal/auth/{userId}']['get']['responses']['200']['content']['application/json']

export const RheaService = {
	checkUserAccess: async ({
		worldId,
		userId,
		level,
	}: {
		worldId: string
		userId: string
		level: PermissionLevel
	}) => {
		const response = await rheaClient['GET']('/api/internal/auth/{userId}', {
			params: {
				path: { userId },
				query: { worldId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to check user access in RheaService')
		}

		if (!response.data[level]) {
			throw new Error('User does not have required access level')
		}
	},

	fetchDocumentState: async ({ userId, worldId, entityId, entityType }: DocumentMetadata) => {
		const response = await (() => {
			if (entityType === 'actor') {
				return rheaClient['GET']('/api/world/{worldId}/actor/{actorId}/content', {
					params: {
						path: { worldId, actorId: entityId },
						query: { acceptDeltas: true },
					},
					headers: {
						[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
						[IMPERSONATED_USER_HEADER]: userId,
					},
				})
			} else if (entityType === 'event') {
				return rheaClient['GET']('/api/world/{worldId}/event/{eventId}/content', {
					params: {
						path: { worldId, eventId: entityId },
						query: { acceptDeltas: true },
					},
					headers: {
						[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
						[IMPERSONATED_USER_HEADER]: userId,
					},
				})
			} else if (entityType === 'article') {
				return rheaClient['GET']('/api/world/{worldId}/article/{articleId}/content', {
					params: {
						path: { worldId, articleId: entityId },
						query: { acceptDeltas: true },
					},
					headers: {
						[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
						[IMPERSONATED_USER_HEADER]: userId,
					},
				})
			}
			throw new Error('Invalid entity type for fetchDocumentState')
		})()

		if (!response.data || response.error) {
			console.error(response.error)
			throw new Error('Failed to fetch document state from Rhea: ')
		}

		return response.data
	},

	flushDocumentState: async ({
		userId,
		worldId,
		entityId,
		entityType,
		contentRich,
		contentDeltas,
	}: {
		userId: string
		worldId: string
		entityId: string
		entityType: 'actor' | 'event' | 'article'
		contentRich: string
		contentDeltas: string
	}) => {
		const response = await (() => {
			if (entityType === 'actor') {
				return rheaClient['PUT']('/api/world/{worldId}/actor/{actorId}/content', {
					params: { path: { worldId, actorId: entityId } },
					body: { content: contentRich, contentDeltas },
					headers: {
						[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
						[IMPERSONATED_USER_HEADER]: userId,
					},
				})
			} else if (entityType === 'event') {
				return rheaClient['PUT']('/api/world/{worldId}/event/{eventId}/content', {
					params: { path: { worldId, eventId: entityId } },
					body: { content: contentRich, contentDeltas },
					headers: {
						[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
						[IMPERSONATED_USER_HEADER]: userId,
					},
				})
			} else if (entityType === 'article') {
				return rheaClient['PUT']('/api/world/{worldId}/article/{articleId}/content', {
					params: { path: { worldId, articleId: entityId } },
					body: { content: contentRich, contentDeltas },
					headers: {
						[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
						[IMPERSONATED_USER_HEADER]: userId,
					},
				})
			}
			throw new Error('Invalid entity type for flushDocumentState')
		})()

		if (response.error) {
			console.error(response)
			throw new Error('Failed to flush document state to Rhea')
		}
	},
}
