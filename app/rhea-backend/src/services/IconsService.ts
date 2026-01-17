import { getPrismaClient } from './dbClients/DatabaseClient.js'
import { IconifyService } from './IconifyService.js'

export const IconsService = {
	getUserFavoriteIconSets: async (userId: string) => {
		const favorites = await getPrismaClient().userFavoriteIconSet.findMany({
			where: {
				userId,
			},
		})

		const allCollections = await IconifyService.getCollections()

		return favorites.map((collection) => ({
			id: collection.iconSet,
			name: allCollections[collection.iconSet]?.name ?? collection.iconSet,
			icons: allCollections[collection.iconSet]?.samples ?? [],
			count: allCollections[collection.iconSet]?.samples.length ?? 0,
			procedural: false,
		}))
	},

	addUserFavoriteIcon: async (userId: string, iconId: string) => {
		return getPrismaClient().userFavoriteIconSet.create({
			data: {
				userId,
				iconSet: iconId,
			},
		})
	},

	removeUserFavoriteIcon: async (userId: string, iconId: string) => {
		return getPrismaClient().userFavoriteIconSet.deleteMany({
			where: {
				userId,
				iconSet: iconId,
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

		return [
			{
				id: 'common',
				name: 'Commonly Used',
				icons: icons
					.sort((a, b) => b._count.icon - a._count.icon || a.icon.localeCompare(b.icon))
					.map((icon) => icon.icon),
				count: icons.length,
				procedural: true,
			},
		]
	},
}
