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
		data: Omit<WorldEventTrack, 'id' | 'worldId' | 'createdAt' | 'updatedAt' | 'position' | 'visible'> & {
			position?: number
		}
	}) => {
		const trackCount = await getPrismaClient().worldEventTrack.count({
			where: {
				worldId,
			},
		})
		const [eventTrack, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEventTrack.create({
				data: {
					name: data.name,
					position: data.position ?? trackCount,
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

	swapEventTracks: async ({
		worldId,
		trackIdA,
		trackIdB,
	}: {
		worldId: string
		trackIdA: string
		trackIdB: string
	}) => {
		const [trackA, trackB] = await Promise.all([
			getPrismaClient().worldEventTrack.findFirst({
				where: {
					id: trackIdA,
				},
				select: {
					position: true,
				},
			}),
			getPrismaClient().worldEventTrack.findFirst({
				where: {
					id: trackIdB,
				},
				select: {
					position: true,
				},
			}),
		])

		if (!trackA || !trackB) {
			throw new Error('One of the tracks does not exist')
		}

		const [, , world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEventTrack.update({
				where: {
					id: trackIdA,
				},
				data: {
					position: trackB.position,
				},
			}),
			getPrismaClient().worldEventTrack.update({
				where: {
					id: trackIdB,
				},
				data: {
					position: trackA.position,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return { world }
	},

	deleteEventTrack: async ({ worldId, trackId }: { worldId: string; trackId: string }) => {
		return await getPrismaClient().$transaction(async (prisma) => {
			await prisma.worldEvent.updateMany({
				where: {
					worldId,
					worldEventTrackId: trackId,
				},
				data: {
					worldEventTrackId: null,
				},
			})
			await prisma.worldEventTrack.delete({
				where: {
					id: trackId,
				},
			})
			const tracks = await prisma.worldEventTrack.findMany({
				where: {
					worldId,
				},
				orderBy: {
					position: 'asc',
				},
				select: {
					id: true,
				},
			})

			await Promise.all(
				tracks.map((track, index) =>
					prisma.worldEventTrack.update({
						where: {
							id: track.id,
						},
						data: {
							position: index,
						},
					}),
				),
			)

			const world = await makeTouchWorldQuery(worldId)

			return {
				world,
			}
		})
	},
}
