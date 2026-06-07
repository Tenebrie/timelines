import { WikiFolder } from '@prisma/client'
import { getPrismaClient } from '@src/services/dbClients/DatabaseClient.js'
import { BadRequestError } from 'moonflower'

import { makeSortWikiArticlesQuery } from './dbQueries/makeSortWikiArticlesQuery.js'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery.js'
import { BulkActionService } from './WorldBulkActionService.js'

export const WikiFolderService = {
	listWikiFolders: async (params: Pick<WikiFolder, 'worldId'>) => {
		return getPrismaClient().wikiFolder.findMany({
			where: { worldId: params.worldId },
			include: { children: true },
		})
	},

	createWikiFolder: async (
		params: Pick<WikiFolder, 'worldId' | 'name'> & {
			icon?: string
			color?: string
			parentId?: string | null
		},
	) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const entityCount = await BulkActionService.countWikiEntities({ worldId: params.worldId, prisma })

			const baseFolder = await prisma.wikiFolder.create({
				data: {
					worldId: params.worldId,
					name: params.name,
					icon: params.icon,
					color: params.color,
					parentFolderId: params.parentId,
					parentFolderPosition: entityCount * 2,
				},
				include: { children: true },
			})

			await makeTouchWorldQuery(params.worldId, prisma)
			await makeSortWikiArticlesQuery(params.worldId, prisma)

			const folder = await prisma.wikiFolder.findFirst({
				where: {
					id: baseFolder.id,
				},
				include: { children: true },
			})

			return folder!
		})
	},

	updateWikiFolder: async (
		params: Partial<Pick<WikiFolder, 'name' | 'icon' | 'color'>> & {
			id: string
			worldId: string
		},
	) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const folder = await prisma.wikiFolder.update({
				where: { id: params.id, worldId: params.worldId },
				data: {
					name: params.name,
					icon: params.icon,
					color: params.color,
				},
				include: { children: true },
			})

			await makeTouchWorldQuery(params.worldId, prisma)

			return folder
		})
	},

	deleteWikiFolder: async ({ worldId, folderId }: { worldId: string; folderId: string }) => {
		const folder = await getPrismaClient().wikiFolder.findFirst({
			where: { id: folderId, worldId },
		})
		if (!folder) {
			throw new BadRequestError('Folder not found')
		}

		return getPrismaClient().$transaction(async (prisma) => {
			await prisma.wikiFolder.delete({ where: { id: folderId } })
			await makeTouchWorldQuery(worldId, prisma)
		})
	},
}
