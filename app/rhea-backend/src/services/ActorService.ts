import { Prisma } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient.js'
import { makeSortWikiArticlesQuery } from './dbQueries/makeSortWikiArticlesQuery.js'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery.js'
import { makeUpdateActorQuery, UpdateActorQueryParams } from './dbQueries/makeUpdateActorQuery.js'
import { MentionedByEntry } from './TagService.js'
import { BulkActionService } from './WorldBulkActionService.js'

export const ActorService = {
	findActor: async ({ worldId, actorId }: { worldId: string; actorId: string | null | undefined }) => {
		if (!actorId) {
			return null
		}
		return getPrismaClient().actor.findUnique({
			where: { id: actorId, worldId },
			include: {
				mentions: {
					distinct: ['targetId'],
					select: {
						targetId: true,
						targetType: true,
					},
				},
				mentionedIn: {
					distinct: ['sourceId'],
					select: {
						sourceId: true,
						sourceType: true,
					},
				},
				pages: {
					select: {
						id: true,
						name: true,
					},
				},
				nodes: true,
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
			const entityCount = await BulkActionService.countWikiEntities({
				worldId,
				folderId: createData.parentFolderId ?? null,
				prisma,
			})

			const baseActor = await getPrismaClient(prisma).actor.create({
				data: {
					worldId,
					...createData,
					parentFolderPosition: entityCount * 2,
				},
				select: {
					id: true,
					color: true,
				},
			})

			const world = await makeTouchWorldQuery(worldId, prisma)
			await makeSortWikiArticlesQuery(worldId, prisma)

			const { actor } = await makeUpdateActorQuery({
				worldId,
				actorId: baseActor.id,
				params: updateData,
				prisma,
			})

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
			const { actor, updatedMentions } = await makeUpdateActorQuery({
				worldId,
				actorId,
				params,
				prisma,
			})
			const world = await makeTouchWorldQuery(worldId, prisma)
			return {
				world,
				actor,
				updatedMentions,
			}
		})
	},

	deleteActor: async ({ worldId, actorId }: { worldId: string; actorId: string }) => {
		return await getPrismaClient().$transaction(async (prisma) => {
			const actor = await prisma.actor.delete({
				where: {
					id: actorId,
				},
			})
			const world = await makeTouchWorldQuery(worldId, prisma)
			const updatedMentions = await prisma.mention.findMany({
				where: {
					sourceActorId: actorId,
				},
			})

			return {
				actor,
				world,
				updatedMentions,
			}
		})
	},

	findActorBacklinks: async ({ worldId, actorId }: { worldId: string; actorId: string }) => {
		const actor = await getPrismaClient().actor.findUnique({
			where: { id: actorId, worldId },
			include: {
				mentionedIn: {
					distinct: ['sourceId'],
					include: {
						sourceActor: {
							select: { id: true, name: true },
						},
						sourceEvent: {
							select: { id: true, name: true },
						},
						sourceArticle: {
							select: { id: true, name: true },
						},
						sourceTag: {
							select: { id: true, name: true },
						},
					},
				},
			},
		})

		if (!actor) {
			return null
		}

		const mentionedBy: MentionedByEntry[] = actor.mentionedIn.map((mention) => {
			const source = mention.sourceActor ?? mention.sourceEvent ?? mention.sourceArticle ?? mention.sourceTag
			return {
				type: mention.sourceType,
				id: source?.id ?? mention.sourceId,
				name: source?.name ?? 'Unknown',
			}
		})

		return mentionedBy
	},
}
