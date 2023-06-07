import { Actor } from '@prisma/client'

import { dbClient } from './DatabaseClient'
import { touchWorld } from './WorldService'

export const ActorService = {
	findActorsByIds: async (actorIds: string[]) => {
		return dbClient.actor.findMany({
			where: {
				id: {
					in: actorIds,
				},
			},
		})
	},

	createActor: async (
		worldId: string,
		data: Pick<Actor, 'name'> & Partial<Pick<Actor, 'title' | 'description'>>
	) => {
		const [actor, world] = await dbClient.$transaction([
			dbClient.actor.create({
				data: {
					worldId,
					name: data.name,
					title: data.title,
					description: data.description,
				},
				select: {
					id: true,
				},
			}),
			touchWorld(worldId),
		])
		return {
			actor,
			world,
		}
	},

	updateActor: async ({
		worldId,
		actorId,
		params,
	}: {
		worldId: string
		actorId: string
		params: Partial<Actor>
	}) => {
		const [actor, world] = await dbClient.$transaction([
			dbClient.actor.update({
				where: {
					id: actorId,
				},
				data: params,
			}),
			touchWorld(worldId),
		])
		return {
			actor,
			world,
		}
	},

	deleteActor: async ({ worldId, actorId }: { worldId: string; actorId: string }) => {
		const [actor, world] = await dbClient.$transaction([
			dbClient.actor.delete({
				where: {
					id: actorId,
				},
			}),
			touchWorld(worldId),
		])
		return {
			actor,
			world,
		}
	},
}
