import { Actor, WorldEvent } from '@prisma/client'

import { dbClient } from '../DatabaseClient'

export type CreateWorldQueryData = Parameters<typeof makeCreateWorldEventQuery>[1]

export const makeCreateWorldEventQuery = (
	worldId: string,
	data: Pick<
		WorldEvent,
		'type' | 'extraFields' | 'name' | 'description' | 'timestamp' | 'revokedAt' | 'icon' | 'replacedEventId'
	> & {
		customNameEnabled: boolean
		targetActors: Actor[]
		mentionedActors: Actor[]
		replacedByEventId?: string | null
	}
) =>
	dbClient.worldEvent.create({
		data: {
			worldId,
			type: data.type,
			extraFields: data.extraFields,
			name: data.name,
			icon: data.icon,
			description: data.description,
			timestamp: data.timestamp,
			revokedAt: data.revokedAt,
			replacedEventId: data.replacedEventId,
			replacedByEventId: data.replacedByEventId,
			targetActors: {
				connect: data.targetActors.map((actor) => ({ id: actor.id })),
			},
			mentionedActors: {
				connect: data.mentionedActors.map((actor) => ({ id: actor.id })),
			},
			customName: data.customNameEnabled,
		},
		select: {
			id: true,
		},
	})
