import { WorldEvent, WorldEventDelta } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery'

export const WorldEventDeltaService = {
	createEventDeltaState: async ({
		worldId,
		eventId,
		data,
	}: {
		worldId: string
		eventId: string
		data: Omit<WorldEventDelta, 'id' | 'worldEventId' | 'createdAt' | 'updatedAt'>
	}) => {
		const [deltaState, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEventDelta.create({
				data: {
					worldEventId: eventId,
					name: data.name,
					description: data.description,
					timestamp: data.timestamp,
				},
				select: {
					id: true,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			deltaState,
			world,
		}
	},

	updateEventDeltaState: async ({
		worldId,
		eventId,
		deltaId,
		params,
		eventParams,
	}: {
		worldId: string
		eventId: string
		deltaId: string
		params: Partial<WorldEventDelta>
		eventParams: Partial<Pick<WorldEvent, 'worldEventTrackId'>>
	}) => {
		const [deltaState, event, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEventDelta.update({
				where: {
					id: deltaId,
				},
				data: params,
			}),
			getPrismaClient().worldEvent.update({
				where: {
					id: eventId,
				},
				data: eventParams,
				include: {
					deltaStates: true,
					targetActors: true,
					mentionedActors: true,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			deltaState,
			event,
			world,
		}
	},

	deleteEventDeltaState: async ({ worldId, deltaId }: { worldId: string; deltaId: string }) => {
		const [deltaState, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEventDelta.delete({
				where: {
					id: deltaId,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			deltaState,
			world,
		}
	},
}
