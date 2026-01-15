import { getPrismaClient } from './dbClients/DatabaseClient.js'
import { IconifyService } from './IconifyService.js'

export const IconsService = {
	getUserFavoriteIcons: async (userId: string) => {
		return getPrismaClient().userFavoriteIconSet.findMany({
			where: {
				userId,
			},
		})
	},

	getCommonWorldEventIcons: async (worldId: string) => {
		const icons = await getPrismaClient().worldEvent.groupBy({
			by: ['icon'],
			where: { worldId, icon: { not: 'default' } },
			_count: { icon: true },
			orderBy: { _count: { icon: 'desc' } },
			take: 10,
		})

		const collections = new Map<string, { icons: string[]; count: number }>()
		for (const icon of icons) {
			const collectionId = icon.icon.split(':')[0]
			const collection = collections.get(collectionId) || { icons: [], count: 0 }
			collection.icons.push(icon.icon)
			collection.count += icon._count.icon
			collections.set(collectionId, collection)
		}

		const iconifyCollections = await IconifyService.getCollections()

		return Array.from(collections.entries())
			.map(([id, { icons, count }]) => ({
				id,
				name: iconifyCollections[id]?.name || id,
				icons,
				count,
			}))
			.sort((a, b) => b.count - a.count)
	},
}
