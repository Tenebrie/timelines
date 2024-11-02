import { WorldEventTrack } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery'

export const WorldEventTrackService = {
	listEventTracks: async ({ worldId }: { worldId: string }) => {
		return getPrismaClient().worldEventTrack.findMany({
			where: {
				worldId,
			},
		})
	},

	createEventTrack: async ({
		worldId,
		data,
	}: {
		worldId: string
		data: Omit<WorldEventTrack, 'id' | 'worldId' | 'createdAt' | 'updatedAt'>
	}) => {
		const [eventTrack, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEventTrack.create({
				data: {
					name: data.name,
					position: data.position,
					worldId,
				},
				select: {
					id: true,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			eventTrack,
			world,
		}
	},
}
