import { WorldEvent } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient'

export const makeUnrevokeWorldEventQuery = ({ event }: { event: WorldEvent }) =>
	getPrismaClient().worldEvent.update({
		where: {
			id: event.id,
		},
		data: {
			revokedAt: null,
			extraFields: event.extraFields.filter((field) => field !== 'RevokedAt'),
		},
	})
