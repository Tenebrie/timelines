import { MentionedEntity, Prisma } from '@prisma/client'
import { ContentPageUpdateWithoutParentActorInput } from 'prisma/client/models.js'

import { getPrismaClient } from './dbClients/DatabaseClient.js'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery.js'
import { makeUpdateActorQuery, UpdateActorQueryParams } from './dbQueries/makeUpdateActorQuery.js'
import { MentionData, MentionsService } from './MentionsService.js'

export const ActorService = {
	findActor: async ({ worldId, actorId }: { worldId: string; actorId: string | null | undefined }) => {
		if (!actorId) {
			return null
		}
		return getPrismaClient().actor.findUnique({
			where: { id: actorId, worldId },
			include: {
				node: true,
				mentions: {
					select: {
						targetId: true,
						targetType: true,
					},
				},
				pages: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		})
	},

	findActorOrThrow: async ({ worldId, actorId }: { worldId: string; actorId: string | null | undefined }) => {
		const actor = await ActorService.findActor({ worldId, actorId })
		if (!actor) {
			throw new Error('Actor not found')
		}
		return actor
	},

	getActorContentPage: async ({
		worldId,
		actorId,
		pageId,
	}: {
		worldId: string
		actorId: string
		pageId: string
	}) => {
		const actor = await getPrismaClient().actor.findUnique({
			where: {
				id: actorId,
				worldId,
			},
			include: {
				pages: {
					where: {
						id: pageId,
					},
				},
			},
		})
		if (actor && actor.pages.length > 0) {
			return actor.pages[0]
		}
		return null
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

	createActorContentPage: async ({
		worldId,
		actorId,
		name,
	}: {
		worldId: string
		actorId: string
		name: string
	}) => {
		return getPrismaClient().$transaction(async (dbClient) => {
			const actor = await dbClient.actor.update({
				where: {
					id: actorId,
					worldId,
				},
				data: {
					pages: {
						create: {
							name,
						},
					},
				},
				include: {
					pages: true,
				},
			})
			const page = actor.pages.find((page) => page.name === name)
			if (!page) {
				throw new Error('Page not created')
			}
			return { actor, page }
		})
	},

	updateActorContentPage: async ({
		worldId,
		actorId,
		pageId,
		params,
	}: {
		worldId: string
		actorId: string
		pageId: string
		params: Omit<ContentPageUpdateWithoutParentActorInput, 'mentions'> & {
			mentions: MentionData[]
		}
	}) => {
		const { mentions, ...data } = params
		return getPrismaClient().$transaction(async (prisma) => {
			const mentionedEntities = await MentionsService.createMentions(
				actorId,
				MentionedEntity.Actor,
				mentions,
				prisma,
			)

			const page = await prisma.actor.update({
				where: {
					id: actorId,
					worldId,
				},
				data: {
					pages: {
						update: {
							where: {
								id: pageId,
							},
							data: {
								...data,
								mentions: {
									set: mentionedEntities.map((mention) => ({
										sourceId_targetId: {
											sourceId: mention.sourceId,
											targetId: mention.targetId,
										},
									})),
								},
							},
						},
					},
				},
			})

			await MentionsService.clearOrphanedMentions(prisma)

			return page
		})
	},

	deleteActorContentPage: async ({
		worldId,
		actorId,
		pageId,
	}: {
		worldId: string
		actorId: string
		pageId: string
	}) => {
		return getPrismaClient().actor.update({
			where: {
				id: actorId,
				worldId,
			},
			data: {
				pages: {
					delete: {
						id: pageId,
					},
				},
			},
			include: {
				node: true,
				mentions: {
					select: {
						targetId: true,
						targetType: true,
					},
				},
				pages: {
					select: {
						id: true,
						name: true,
					},
					orderBy: {
						createdAt: 'asc',
					},
				},
			},
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
