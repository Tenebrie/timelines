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
		const parent = await prisma.wikiFolder.findFirst({
			where: {
				worldId,
				id: currentTarget,
			},
			select: {
				id: true,
				parentFolderId: true,
			},
		})

		if (!parent || !parent.parentFolderId) {
			break
		}

		if (ancestors.includes(parent.parentFolderId)) {
			throw new Error('Circular reference detected')
		}

		currentTarget = parent.parentFolderId
		ancestors.push(currentTarget)
	}

	return ancestors
}
