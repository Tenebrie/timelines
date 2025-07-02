import { WorldEvent } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient.js'

export const makeUnrevokeWorldEventQuery = ({ event }: { event: WorldEvent }) =>
	getPrismaClient().worldEvent.update({
		where: {
			id: event.id,
		},
		data: {
			revokedAt: null,
		},
	})
