import { IMPERSONATED_USER_HEADER, SERVICE_AUTH_TOKEN_HEADER } from '@src/ts-shared/const/constants.js'
import createClient from 'openapi-fetch'

import type { paths } from '../api/rhea-api.js'
import { TokenService } from './TokenService.js'

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

	listWorlds: async (userId: string) => {
		const response = await rheaClient['GET']('/api/worlds', {
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to list worlds: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	createWorld: async ({
		userId,
		name,
		description,
		timeOrigin,
	}: {
		userId: string
		name: string
		description?: string
		timeOrigin?: number
	}) => {
		const response = await rheaClient['POST']('/api/worlds', {
			body: {
				name,
				description,
				calendar: 'EARTH',
				timeOrigin,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to create world: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	getWorldDetails: async ({ worldId, userId }: { worldId: string; userId: string }) => {
		const response = await rheaClient['GET'](`/api/world/{worldId}`, {
			params: {
				path: { worldId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to get world details: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	getWorldArticles: async ({ worldId, userId }: { worldId: string; userId: string }) => {
		const response = await rheaClient['GET'](`/api/world/{worldId}/wiki/articles`, {
			params: {
				path: { worldId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to get world articles: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	// Actor methods
	getActorContent: async ({
		worldId,
		actorId,
		userId,
		pageId,
	}: {
		worldId: string
		actorId: string
		userId: string
		pageId?: string
	}) => {
		const headers = {
			[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
			[IMPERSONATED_USER_HEADER]: userId,
		}
		const response = await (() => {
			if (pageId) {
				return rheaClient['GET']('/api/world/{worldId}/actor/{actorId}/content/pages/{pageId}', {
					params: {
						path: { worldId, actorId, pageId },
					},
					headers,
				})
			}
			return rheaClient['GET']('/api/world/{worldId}/actor/{actorId}/content', {
				params: {
					path: { worldId, actorId },
				},
				headers,
			})
		})()

		if (!response.data || response.error) {
			throw new Error('Failed to get actor content: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	createActor: async ({
		worldId,
		userId,
		name,
		title,
		descriptionRich,
	}: {
		worldId: string
		userId: string
		name: string
		title?: string
		descriptionRich?: string
	}) => {
		const response = await rheaClient['POST']('/api/world/{worldId}/actors', {
			params: {
				path: { worldId },
			},
			body: {
				name,
				title,
				descriptionRich,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to create actor: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	updateActor: async ({
		worldId,
		actorId,
		userId,
		name,
		title,
	}: {
		worldId: string
		actorId: string
		userId: string
		name?: string
		title?: string
	}) => {
		const response = await rheaClient['PATCH']('/api/world/{worldId}/actor/{actorId}', {
			params: {
				path: { worldId, actorId },
			},
			body: {
				name,
				title,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to update actor: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	updateActorContent: async ({
		worldId,
		actorId,
		userId,
		content,
	}: {
		worldId: string
		actorId: string
		userId: string
		content: string
	}) => {
		await rheaClient['PUT']('/api/world/{worldId}/actor/{actorId}/content', {
			params: {
				path: { worldId, actorId },
			},
			body: {
				content,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
	},

	createActorContentPage: async ({
		worldId,
		actorId,
		userId,
		pageName,
	}: {
		worldId: string
		actorId: string
		userId: string
		pageName: string
	}) => {
		const response = await rheaClient['POST']('/api/world/{worldId}/actor/{actorId}/content/pages', {
			params: {
				path: { worldId, actorId },
			},
			body: {
				name: pageName,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to create actor content page: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	updateActorContentPage: async ({
		worldId,
		actorId,
		userId,
		content,
		pageId,
	}: {
		worldId: string
		actorId: string
		userId: string
		content: string
		pageId: string
	}) => {
		await rheaClient['PUT']('/api/world/{worldId}/actor/{actorId}/content/pages/{pageId}', {
			params: {
				path: { worldId, actorId, pageId },
			},
			body: {
				content,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
	},

	deleteActorContentPage: async ({
		worldId,
		actorId,
		userId,
		pageId,
	}: {
		worldId: string
		actorId: string
		userId: string
		pageId: string
	}) => {
		await rheaClient['DELETE']('/api/world/{worldId}/actor/{actorId}/content/pages/{pageId}', {
			params: {
				path: { worldId, actorId, pageId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
	},

	deleteActor: async ({ worldId, actorId, userId }: { worldId: string; actorId: string; userId: string }) => {
		const response = await rheaClient['DELETE']('/api/world/{worldId}/actor/{actorId}', {
			params: {
				path: { worldId, actorId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})

		return response.data
	},

	// Event methods
	getEventContent: async ({
		worldId,
		eventId,
		userId,
	}: {
		worldId: string
		eventId: string
		userId: string
	}) => {
		const response = await rheaClient['GET']('/api/world/{worldId}/event/{eventId}/content', {
			params: {
				path: { worldId, eventId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to get event content: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	createEvent: async ({
		worldId,
		userId,
		name,
		timestamp,
		descriptionRich,
	}: {
		worldId: string
		userId: string
		name: string
		timestamp: string
		descriptionRich: string
	}) => {
		const response = await rheaClient['POST']('/api/world/{worldId}/event', {
			params: {
				path: { worldId },
			},
			body: {
				name,
				timestamp,
				descriptionRich,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to create event: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	updateEvent: async ({
		worldId,
		eventId,
		userId,
		name,
		timestamp,
	}: {
		worldId: string
		eventId: string
		userId: string
		name?: string
		timestamp?: string
	}) => {
		const response = await rheaClient['PATCH']('/api/world/{worldId}/event/{eventId}', {
			params: {
				path: { worldId, eventId },
			},
			body: {
				name,
				timestamp,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to update event: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	updateEventContent: async ({
		worldId,
		eventId,
		userId,
		content,
	}: {
		worldId: string
		eventId: string
		userId: string
		content: string
	}) => {
		await rheaClient['PUT']('/api/world/{worldId}/event/{eventId}/content', {
			params: {
				path: { worldId, eventId },
			},
			body: {
				content,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
	},

	deleteEvent: async ({ worldId, eventId, userId }: { worldId: string; eventId: string; userId: string }) => {
		const response = await rheaClient['DELETE']('/api/world/{worldId}/event/{eventId}', {
			params: {
				path: { worldId, eventId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})

		return response.data
	},

	// Article methods
	getArticleContent: async ({
		worldId,
		articleId,
		userId,
	}: {
		worldId: string
		articleId: string
		userId: string
	}) => {
		const response = await rheaClient['GET']('/api/world/{worldId}/article/{articleId}/content', {
			params: {
				path: { worldId, articleId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to get article content: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	createArticle: async ({ worldId, userId, name }: { worldId: string; userId: string; name: string }) => {
		const response = await rheaClient['POST']('/api/world/{worldId}/wiki/articles', {
			params: {
				path: { worldId },
			},
			body: {
				name,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to create article: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	updateArticle: async ({
		worldId,
		articleId,
		userId,
		name,
	}: {
		worldId: string
		articleId: string
		userId: string
		name?: string
	}) => {
		const response = await rheaClient['PATCH']('/api/world/{worldId}/wiki/article/{articleId}', {
			params: {
				path: { worldId, articleId },
			},
			body: {
				name,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to update article: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	updateArticleContent: async ({
		worldId,
		articleId,
		userId,
		content,
	}: {
		worldId: string
		articleId: string
		userId: string
		content: string
	}) => {
		await rheaClient['PUT']('/api/world/{worldId}/article/{articleId}/content', {
			params: {
				path: { worldId, articleId },
			},
			body: {
				content,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
	},

	deleteArticle: async ({
		worldId,
		articleId,
		userId,
	}: {
		worldId: string
		articleId: string
		userId: string
	}) => {
		await rheaClient['DELETE']('/api/world/{worldId}/wiki/article/{articleId}', {
			params: {
				path: { worldId, articleId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
	},

	searchWorld: async ({ worldId, query, userId }: { worldId: string; query: string; userId: string }) => {
		const response = await rheaClient['GET']('/api/world/{worldId}/search/{query}', {
			params: {
				path: { worldId, query },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to search world: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	// Tag methods
	getTagDetails: async ({ worldId, tagId, userId }: { worldId: string; tagId: string; userId: string }) => {
		const response = await rheaClient['GET']('/api/world/{worldId}/tag/{tagId}', {
			params: {
				path: { worldId, tagId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to get tag details: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	createTag: async ({
		worldId,
		userId,
		name,
		description,
	}: {
		worldId: string
		userId: string
		name: string
		description?: string
	}) => {
		const response = await rheaClient['POST']('/api/world/{worldId}/tags', {
			params: {
				path: { worldId },
			},
			body: {
				name,
				description,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to create tag: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	updateTag: async ({
		worldId,
		tagId,
		userId,
		name,
		description,
	}: {
		worldId: string
		tagId: string
		userId: string
		name?: string
		description?: string
	}) => {
		const response = await rheaClient['PATCH']('/api/world/{worldId}/tag/{tagId}', {
			params: {
				path: { worldId, tagId },
			},
			body: {
				name,
				description,
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})
		if (!response.data || response.error) {
			throw new Error('Failed to update tag: ' + JSON.stringify(response.error))
		}

		return response.data
	},

	deleteTag: async ({ worldId, tagId, userId }: { worldId: string; tagId: string; userId: string }) => {
		const response = await rheaClient['DELETE']('/api/world/{worldId}/tag/{tagId}', {
			params: {
				path: { worldId, tagId },
			},
			headers: {
				[SERVICE_AUTH_TOKEN_HEADER]: TokenService.produceServiceToken(),
				[IMPERSONATED_USER_HEADER]: userId,
			},
		})

		return response.data
	},
}
