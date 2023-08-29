import { WorldEventDelta } from '@prisma/client'

import { dbClient } from './DatabaseClient'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery'

export const WorldEventDeltaService = {
	createEventDeltaState: async ({
		worldId,
		eventId,
		data,
	}: {
		worldId: string
		eventId: string
		data: Omit<WorldEventDelta, 'id' | 'worldEventId'>
	}) => {
		const [deltaState, world] = await dbClient.$transaction([
			dbClient.worldEventDelta.create({
				data: {
					worldEventId: eventId,
					name: data.name,
					description: data.description,
					timestamp: data.timestamp,
					customName: data.customName,
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
}
