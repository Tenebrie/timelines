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
		deltaId,
		params,
	}: {
		worldId: string
		deltaId: string
		params: Partial<WorldEventDelta>
	}) => {
		const [deltaState, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEventDelta.update({
				where: {
					id: deltaId,
				},
				data: params,
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			deltaState,
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
