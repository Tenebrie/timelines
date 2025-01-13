import { Actor, WorldEvent } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient'

export type CreateWorldQueryData = Parameters<typeof makeCreateWorldEventQuery>[1]

export const makeCreateWorldEventQuery = (
	worldId: string,
	data: Pick<
		WorldEvent,
		| 'type'
		| 'extraFields'
		| 'name'
		| 'description'
		| 'descriptionRich'
		| 'timestamp'
		| 'revokedAt'
		| 'icon'
		| 'externalLink'
		| 'worldEventTrackId'
	> & {
		customNameEnabled: boolean
		mentionedActors: Actor[]
	},
) =>
	getPrismaClient().worldEvent.create({
		data: {
			worldId,
			type: data.type,
			extraFields: data.extraFields,
			name: data.name,
			icon: data.icon,
			description: data.description,
			descriptionRich: data.descriptionRich,
			timestamp: data.timestamp,
			revokedAt: data.revokedAt,
			mentionedActors: {
				connect: data.mentionedActors.map((actor) => ({ id: actor.id })),
			},
			customName: data.customNameEnabled,
			externalLink: data.externalLink,
			worldEventTrackId: data.worldEventTrackId,
		},
		select: {
			id: true,
		},
	})
