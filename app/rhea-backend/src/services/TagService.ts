import { MentionedEntity } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient.js'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery.js'

export type MentionedByEntry = {
	type: MentionedEntity
	id: string
	name: string
}

export const TagService = {
	findTag: async ({ worldId, tagId }: { worldId: string; tagId: string | null | undefined }) => {
		if (!tagId) {
			return null
		}
		return getPrismaClient().tag.findUnique({
			where: { id: tagId, worldId },
		})
	},

	findTagOrThrow: async ({ worldId, tagId }: { worldId: string; tagId: string }) => {
		const tag = await TagService.findTag({ worldId, tagId })
		if (!tag) {
			throw new Error(`Tag not found: ${tagId}`)
		}
		return tag
	},

	findTagWithMentions: async ({ worldId, tagId }: { worldId: string; tagId: string }) => {
		const tag = await getPrismaClient().tag.findUnique({
			where: { id: tagId, worldId },
			include: {
				mentions: true,
				mentionedIn: {
					include: {
						sourceActor: {
							select: {
								id: true,
								name: true,
							},
						},
						sourceEvent: {
							select: {
								id: true,
								name: true,
							},
						},
						sourceArticle: {
							select: {
								id: true,
								name: true,
							},
						},
						sourceTag: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		})

		if (!tag) {
			return null
		}

		const mentionedBy: MentionedByEntry[] = tag.mentionedIn.map((mention) => {
			const source = mention.sourceActor ?? mention.sourceEvent ?? mention.sourceArticle ?? mention.sourceTag
			return {
				type: mention.sourceType,
				id: source?.id ?? mention.sourceId,
				name: source?.name ?? 'Unknown',
			}
		})

		return {
			...tag,
			mentionedIn: undefined,
			mentionedBy,
		}
	},

	listTagsForWorld: async (worldId: string) => {
		return getPrismaClient().tag.findMany({
			where: { worldId },
			include: {
				mentions: true,
				mentionedIn: true,
			},
		})
	},

	createTag: async ({
		worldId,
		params,
	}: {
		worldId: string
		params: {
			name: string
			description?: string
		}
	}) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const tag = await getPrismaClient(prisma).tag.create({
				data: {
					worldId,
					name: params.name,
					description: params.description ?? '',
				},
				include: {
					mentions: true,
					mentionedIn: true,
				},
			})

			const world = await makeTouchWorldQuery(worldId, prisma)

			return {
				world,
				tag,
			}
		})
	},

	updateTag: async ({
		worldId,
		tagId,
		params,
	}: {
		worldId: string
		tagId: string
		params: {
			name?: string
			description?: string
		}
	}) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const tag = await getPrismaClient(prisma).tag.update({
				where: { id: tagId, worldId },
				data: {
					name: params.name,
					description: params.description,
				},
				include: {
					mentions: true,
					mentionedIn: true,
				},
			})

			const world = await makeTouchWorldQuery(worldId, prisma)

			return {
				world,
				tag,
			}
		})
	},

	deleteTag: async ({ worldId, tagId }: { worldId: string; tagId: string }) => {
		const [tag, world] = await getPrismaClient().$transaction([
			getPrismaClient().tag.delete({
				where: { id: tagId, worldId },
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			tag,
			world,
		}
	},
}
