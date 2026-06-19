import { Prisma } from '@prisma/client'
import { BadRequestError } from 'moonflower'

import { makeFetchArticleAncestorsQuery } from './makeFetchArticleAncestorsQuery.js'

export const makeMoveWikiEntityQuery = async (
	params: {
		worldId: string
		entityId: string
		toPosition: number
		toParentId?: string | null
	},
	prisma: Prisma.TransactionClient,
) => {
	const [baseEntity, type] = await (async () => {
		const findParams = {
			where: { id: params.entityId },
			select: {
				id: true,
				parentFolderId: true,
			},
		}

		const [actor, article, folder, event, tag] = await Promise.all([
			prisma.actor.findFirst(findParams),
			prisma.wikiArticle.findFirst(findParams),
			prisma.wikiFolder.findFirst(findParams),
			prisma.worldEvent.findFirst(findParams),
			prisma.tag.findFirst(findParams),
		])
		if (actor) {
			return [actor, 'actor'] as const
		} else if (article) {
			return [article, 'article'] as const
		} else if (folder) {
			return [folder, 'folder'] as const
		} else if (event) {
			return [event, 'event'] as const
		} else if (tag) {
			return [tag, 'tag'] as const
		}
		throw new BadRequestError('Unsupported entity type')
	})()

	if (!baseEntity) {
		throw new BadRequestError('Article not found')
	}

	if (params.toParentId === baseEntity.id) {
		throw new BadRequestError('Cannot move article to be its own parent')
	}

	if (params.toParentId && type === 'folder') {
		const ancestors = await makeFetchArticleAncestorsQuery(params.worldId, params.toParentId, prisma)
		if (ancestors.includes(params.entityId)) {
			throw new BadRequestError('Cannot move article to be its own descendant')
		}
	}

	const updateParams = {
		where: {
			id: params.entityId,
		},
		data: {
			parentFolderId: params.toParentId,
			parentFolderPosition: params.toPosition,
		},
	}

	if (type === 'actor') {
		await prisma.actor.update(updateParams)
	} else if (type === 'article') {
		await prisma.wikiArticle.update(updateParams)
	} else if (type === 'folder') {
		await prisma.wikiFolder.update(updateParams)
	} else if (type === 'event') {
		await prisma.worldEvent.update(updateParams)
	} else if (type === 'tag') {
		await prisma.tag.update(updateParams)
	}

	return { id: params.entityId, type }
}
