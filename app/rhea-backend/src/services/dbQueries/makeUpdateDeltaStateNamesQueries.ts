import { Prisma } from '@prisma/client'
import { generateEntityNameFromText } from '@src/ts-shared/utils/generateEntityNameFromText'

import { getPrismaClient } from '../dbClients/DatabaseClient'
import { WorldEventService } from '../WorldEventService'

export const makeUpdateDeltaStateNamesQueries = ({
	event,
	customName,
	customNameEnabled,
	prisma,
}: {
	event: Awaited<ReturnType<(typeof WorldEventService)['fetchWorldEventWithDetails']>>
	customName: string | undefined
	customNameEnabled: boolean | undefined
	prisma?: Prisma.TransactionClient
}) => {
	if (customNameEnabled && customName) {
		return Promise.all([
			getPrismaClient(prisma).worldEventDelta.updateMany({
				where: {
					worldEventId: event.id,
				},
				data: {
					name: null,
				},
			}),
		])
	} else {
		return Promise.all(
			event.deltaStates.map((state) =>
				getPrismaClient(prisma).worldEventDelta.updateMany({
					where: {
						id: state.id,
					},
					data: {
						name: generateEntityNameFromText({
							source: state.description ?? '',
						}),
					},
				}),
			),
		)
	}
}
