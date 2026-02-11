import { WorldEvent } from '@prisma/client'
import { definedProps } from '@src/utils/definedProps.js'
import { BadRequestError } from 'moonflower'

import { getPrismaClient } from './dbClients/DatabaseClient.js'
import { WorldEventService } from './WorldEventService.js'

export const ValidationService = {
	isActorValid: async (actorId: string) => {
		const count = await getPrismaClient().actor.count({
			where: {
				id: actorId,
			},
		})
		return count > 0
	},

	isArticleValid: async (articleId: string) => {
		const count = await getPrismaClient().wikiArticle.count({
			where: {
				id: articleId,
			},
		})
		return count > 0
	},

	isEventValid: async (eventId: string) => {
		const count = await getPrismaClient().worldEvent.count({
			where: {
				id: eventId,
			},
		})
		return count > 0
	},

	isEventDeltaStateValid: async (deltaId: string) => {
		const count = await getPrismaClient().worldEventDelta.count({
			where: {
				id: deltaId,
			},
		})
		return count > 0
	},

	isTagValid: async (tagId: string) => {
		const count = await getPrismaClient().tag.count({
			where: {
				id: tagId,
			},
		})
		return count > 0
	},

	checkActorValidity: async (actorId: string) => {
		if (!ValidationService.isActorValid(actorId)) {
			throw new BadRequestError('Actor does not exist')
		}
	},

	checkArticleValidity: async (articleId: string) => {
		if (!ValidationService.isArticleValid(articleId)) {
			throw new BadRequestError('Article does not exist')
		}
	},

	checkEventValidity: async (eventId: string) => {
		if (!ValidationService.isEventValid(eventId)) {
			throw new BadRequestError('Event does not exist')
		}
	},

	checkEventDeltaStateValidity: async (deltaId: string) => {
		if (!ValidationService.isEventDeltaStateValid(deltaId)) {
			throw new BadRequestError('Event delta state does not exist')
		}
	},

	checkTagValidity: async (tagId: string) => {
		if (!ValidationService.isTagValid(tagId)) {
			throw new BadRequestError('Tag does not exist')
		}
	},

	checkEventPatchValidity: async (eventId: string, params: Partial<WorldEvent>) => {
		const originalEvent = await WorldEventService.fetchWorldEventWithDetails(eventId)
		const event = {
			...originalEvent,
			...definedProps(params),
		}

		if (event.revokedAt && event.revokedAt <= event.timestamp) {
			throw new BadRequestError('Event cannot be revoked before it is created')
		}
		if (event.deltaStates.some((delta) => delta.timestamp < event.timestamp)) {
			throw new BadRequestError(
				'Unable to retire an event at this timestamp (at least 1 delta state at a later timestamp)',
			)
		}

		const revokedAt = event.revokedAt
		if (revokedAt && event.deltaStates.some((delta) => delta.timestamp > revokedAt)) {
			throw new BadRequestError(
				'Unable to retire an event at this timestamp (at least 1 delta state at a later timestamp)',
			)
		}
	},

	checkIfEventIsRevokableAt: async (eventId: string, timestamp: bigint | null | undefined) => {
		if (timestamp === null || timestamp === undefined) {
			return
		}
		const event = await WorldEventService.fetchWorldEventWithDetails(eventId)
		if (event.deltaStates.some((delta) => delta.timestamp > timestamp)) {
			throw new BadRequestError(
				'Unable to retire an event at this timestamp (at least 1 delta state at a later timestamp)',
			)
		}
	},

	checkIfEventDeltaStateIsCreatableAt: async (
		eventId: string,
		timestamp: bigint,
		excludedDeltaIds: string[] = [],
	) => {
		const event = await WorldEventService.fetchWorldEventWithDetails(eventId)
		if (timestamp < event.timestamp) {
			throw new BadRequestError('Unable to create a delta state before event creation.')
		}
		if (event.revokedAt && timestamp >= event.revokedAt) {
			throw new BadRequestError('Unable to create a delta state after event retirement.')
		}
		if (
			event.deltaStates.some((state) => state.timestamp === timestamp && !excludedDeltaIds.includes(state.id))
		) {
			throw new BadRequestError('Another delta state already exists at this timestamp.')
		}
	},
}
