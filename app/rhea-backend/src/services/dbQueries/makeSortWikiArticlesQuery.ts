import { Prisma } from '@prisma/client'
import { WikiEntityType } from '@src/schema/EntityType.js'

import { getPrismaClient } from '../dbClients/DatabaseClient.js'

export type WikiPositionUpdate = { entityId: string; entityType: WikiEntityType; position: number }

export async function makeSortWikiArticlesQuery(worldId: string, prisma?: Prisma.TransactionClient) {
	const prismaClient = getPrismaClient(prisma)

	const findParams = {
		where: { worldId },
		select: { id: true, parentFolderId: true, parentFolderPosition: true },
	}
	const [articles, folders, events, tags, actors] = await Promise.all([
		prismaClient.wikiArticle.findMany(findParams),
		prismaClient.wikiFolder.findMany(findParams),
		prismaClient.worldEvent.findMany(findParams),
		prismaClient.tag.findMany(findParams),
		prismaClient.actor.findMany(findParams),
	])

	type Entry = {
		id: string
		parentFolderId: string | null
		parentFolderPosition: number
		type: WikiEntityType
	}

	const allEntities: Entry[] = [
		...actors.map((e) => ({ ...e, type: 'actor' as const })),
		...articles.map((e) => ({ ...e, type: 'article' as const })),
		...folders.map((e) => ({ ...e, type: 'folder' as const })),
		...events.map((e) => ({ ...e, type: 'event' as const })),
		...tags.map((e) => ({ ...e, type: 'tag' as const })),
	]

	const byFolder = new Map<string | null, Entry[]>()
	for (const entity of allEntities) {
		const key = entity.parentFolderId
		if (!byFolder.has(key)) {
			byFolder.set(key, [])
		}
		byFolder.get(key)!.push(entity)
	}

	const updates: WikiPositionUpdate[] = []
	for (const entities of byFolder.values()) {
		entities.sort((a, b) => a.parentFolderPosition - b.parentFolderPosition)
		for (const [index, entity] of entities.entries()) {
			const newPosition = index * 2
			if (entity.parentFolderPosition === newPosition) continue
			updates.push({ entityId: entity.id, entityType: entity.type, position: newPosition })
		}
	}

	const promises = updates.map(({ entityId, entityType, position }) => {
		const updateParams = { where: { id: entityId }, data: { parentFolderPosition: position } }
		switch (entityType) {
			case 'actor':
				return prismaClient.actor.update(updateParams)
			case 'article':
				return prismaClient.wikiArticle.update(updateParams)
			case 'folder':
				return prismaClient.wikiFolder.update(updateParams)
			case 'event':
				return prismaClient.worldEvent.update(updateParams)
			case 'tag':
				return prismaClient.tag.update(updateParams)
		}
	})

	await Promise.all(promises)

	return updates
}
