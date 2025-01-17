import { Actor } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery'

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
		data: Pick<Actor, 'name'> & Partial<Pick<Actor, 'title' | 'color' | 'description'>>,
	) => {
		const [actor, world] = await getPrismaClient().$transaction([
			getPrismaClient().actor.create({
				data: {
					worldId,
					name: data.name,
					title: data.title,
					color: data.color ?? '#008080',
					description: data.description,
				},
				include: {
					statements: {
						select: {
							id: true,
						},
					},
				},
			}),
			makeTouchWorldQuery(worldId),
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
		const [actor, world] = await getPrismaClient().$transaction([
			getPrismaClient().actor.update({
				where: {
					id: actorId,
				},
				data: {
					name: params.name,
					title: params.title,
					color: params.color,
					description: params.description,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			actor,
			world,
		}
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
