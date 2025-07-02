import { Prisma } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient.js'

export const makeFetchArticleAncestorsQuery = async (
	worldId: string,
	articleId: string,
	prisma?: Prisma.TransactionClient,
) => {
	prisma = prisma ?? getPrismaClient()

	const ancestors: string[] = []

	let currentTarget = articleId
	for (let i = 0; i < 10; i++) {
		const parent = await prisma.wikiArticle.findFirst({
			where: {
				worldId,
				id: currentTarget,
			},
			select: {
				id: true,
				parentId: true,
			},
		})

		if (!parent || !parent.parentId) {
			break
		}

		if (ancestors.includes(parent.parentId)) {
			throw new Error('Circular reference detected')
		}

		currentTarget = parent.parentId
		ancestors.push(currentTarget)
	}

	return ancestors
}
