import { Prisma } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient'

export const makeSortWikiArticles = async (worldId: string, prisma?: Prisma.TransactionClient) => {
	prisma = prisma ?? getPrismaClient()

	const articles = await prisma.wikiArticle.findMany({
		where: {
			worldId,
		},
		orderBy: {
			position: 'asc',
		},
		select: {
			id: true,
		},
	})

	return Promise.all(
		articles.map((article, index) => {
			return prisma.wikiArticle.update({
				where: {
					id: article.id,
				},
				data: {
					position: index,
				},
			})
		}),
	)
}
