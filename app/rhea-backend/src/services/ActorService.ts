import { Prisma } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery'
import { makeUpdateActorQuery, UpdateActorQueryParams } from './dbQueries/makeUpdateActorQuery'

export const ActorService = {
	findActor: async ({ worldId, actorId }: { worldId: string; actorId: string | null | undefined }) => {
		if (!actorId) {
			return null
		}
		return getPrismaClient().actor.findUnique({
			where: { id: actorId, worldId },
			include: {
				node: true,
			},
		})
	},

	findActorsByIds: async (actorIds: string[]) => {
		return getPrismaClient().actor.findMany({
			where: {
				id: {
					in: actorIds,
				},
			},
		})
	},

	createActor: async ({
		worldId,
		createData,
		updateData,
	}: {
		worldId: string
		createData: Omit<Prisma.ActorUncheckedCreateInput, 'worldId'>
		updateData: UpdateActorQueryParams
	}) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const baseActor = await getPrismaClient(prisma).actor.create({
				data: {
					worldId,
					...createData,
				},
				include: {
					mentions: true,
					mentionedIn: true,
				},
			})

			const actor = await makeUpdateActorQuery({
				actorId: baseActor.id,
				params: updateData,
				prisma,
			})

			const world = await makeTouchWorldQuery(worldId)

			return {
				world,
				actor,
			}
		})
	},

	updateActor: async ({
		worldId,
		actorId,
		params,
	}: {
		worldId: string
		actorId: string
		params: UpdateActorQueryParams
	}) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const actor = await makeUpdateActorQuery({
				actorId,
				params,
				prisma,
			})
			const world = await makeTouchWorldQuery(worldId)
			return {
				world,
				actor,
			}
		})
	},

	deleteActor: async ({ worldId, actorId }: { worldId: string; actorId: string }) => {
		const [actor, world] = await getPrismaClient().$transaction([
			getPrismaClient().actor.delete({
				where: {
					id: actorId,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			actor,
			world,
		}
	},
}
