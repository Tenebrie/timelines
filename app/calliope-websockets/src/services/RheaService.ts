import type { paths } from '@neverkin/openapi-fetch'
import { IMPERSONATED_USER_HEADER, SERVICE_AUTH_TOKEN_HEADER } from '@src/ts-shared/const/constants.js'
import chalk from 'chalk'
import createClient from 'openapi-fetch'

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
		const userData = await RheaService.getUserAccessLevel({ worldId, userId })

		if (!userData[level]) {
			throw new Error('User does not have required access level')
		}
	},

	getUserAccessLevel: async ({ worldId, userId }: { worldId: string; userId: string }) => {
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

		return response.data
	},

	fetchDocumentState: async (userId: string, { worldId, entityId, entityType }: DocumentMetadata) => {
		const response = await rheaClient['GET']('/api/world/{worldId}/{entityType}/{entityId}/content', {
			params: {
				path: { worldId, entityType, entityId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})

		if (!response.data || response.error) {
			console.error(response.error)
			throw new Error('Failed to fetch document state from Rhea: ')
		}

		return response.data
	},

	flushDocumentState: async ({
		lastUserId,
		worldId,
		entityId,
		entityType,
		contentRich,
	}: {
		lastUserId: string
		worldId: string
		entityId: string
		entityType: 'actor' | 'event' | 'article' | 'node'
		contentRich: string
	}) => {
		if (contentRich.length >= 1_131_000) {
			console.error(
				`${chalk.greenBright('[Calliope]')} Unable to flush ${entityType} ${chalk.blueBright(entityId)} (${contentRich.length} bytes)`,
			)
			throw new Error('Failed to flush document state to Rhea')
		}

		const response = await rheaClient['PUT']('/api/world/{worldId}/{entityType}/{entityId}/content', {
			params: { path: { worldId, entityType, entityId } },
			body: { content: contentRich },
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: lastUserId,
			},
		})

		if (response.error) {
			console.error(response)
			throw new Error('Failed to flush document state to Rhea')
		}
	},
}
