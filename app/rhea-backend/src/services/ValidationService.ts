import { WorldEvent } from '@prisma/client'
import { definedProps } from '@src/utils/definedProps'
import { BadRequestError } from 'moonflower'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { WorldEventService } from './WorldEventService'

export const ValidationService = {
	checkEventValidity: async (eventId: string) => {
		const count = await getPrismaClient().worldEvent.count({
			where: {
				id: eventId,
			},
		})
		if (count === 0) {
			throw new BadRequestError('Event does not exist')
		}
	},

	checkEventDeltaStateValidity: async (deltaId: string) => {
		const count = await getPrismaClient().worldEventDelta.count({
			where: {
				id: deltaId,
			},
		})
		if (count === 0) {
			throw new BadRequestError('Event delta state does not exist')
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
