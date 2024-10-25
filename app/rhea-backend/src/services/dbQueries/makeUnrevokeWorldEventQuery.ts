import { WorldEvent } from '@prisma/client'

import { dbClient } from '../dbClients/DatabaseClient'

export const makeUnrevokeWorldEventQuery = ({ event }: { event: WorldEvent }) =>
	dbClient.worldEvent.update({
		where: {
			id: event.id,
		},
		data: {
			revokedAt: null,
			extraFields: event.extraFields.filter((field) => field !== 'RevokedAt'),
		},
	})
