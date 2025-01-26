import { Actor } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery'
import { makeUpdateActorQuery } from './dbQueries/makeUpdateActorQuery'

export const ActorService = {
	findActorsByIds: async (actorIds: string[]) => {
		return getPrismaClient().actor.findMany({
			where: {
				id: {
					in: actorIds,
				},
			},
		})
	},

	createActor: async (
		worldId: string,
		params: Pick<Actor, 'name'> & Parameters<typeof makeUpdateActorQuery>[0]['params'],
	) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const baseActor = await getPrismaClient(prisma).actor.create({
				data: {
					worldId,
					name: params.name,
				},
				include: {
					mentions: true,
					mentionedIn: true,
				},
			})

			const actor = await makeUpdateActorQuery({
				actorId: baseActor.id,
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

	updateActor: async ({
		worldId,
		actorId,
		params,
	}: {
		worldId: string
		actorId: string
		params: Parameters<typeof makeUpdateActorQuery>[0]['params']
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
