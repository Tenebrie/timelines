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

	assignOrphansToTrack: async ({ worldId, trackId }: { worldId: string; trackId: string }) => {
		const [, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEvent.updateMany({
				where: {
					worldId,
					worldEventTrackId: null,
				},
				data: {
					worldEventTrackId: trackId,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			world,
		}
	},

	updateEventTrack: async ({
		worldId,
		trackId,
		data,
	}: {
		worldId: string
		trackId: string
		data: Partial<Omit<WorldEventTrack, 'id' | 'worldId' | 'createdAt' | 'updatedAt'>>
	}) => {
		const [eventTrack, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEventTrack.update({
				where: {
					id: trackId,
				},
				data,
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

	deleteEventTrack: async ({ worldId, trackId }: { worldId: string; trackId: string }) => {
		const [, eventTrack, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEvent.updateMany({
				where: {
					worldId,
					worldEventTrackId: trackId,
				},
				data: {
					worldEventTrackId: null,
				},
			}),
			getPrismaClient().worldEventTrack.delete({
				where: {
					id: trackId,
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
