import { generateEntityNameFromText } from '@src/ts-shared/utils/generateEntityNameFromText'

import { dbClient } from '../dbClients/DatabaseClient'
import { WorldEventService } from '../WorldEventService'

export const makeUpdateDeltaStateNamesQueries = ({
	event,
	customName,
	customNameEnabled,
}: {
	event: Awaited<ReturnType<typeof WorldEventService['fetchWorldEventWithDeltaStates']>>
	customName: string | undefined
	customNameEnabled: boolean | undefined
}) => {
	if (customNameEnabled && customName) {
		return [
			dbClient.worldEventDelta.updateMany({
				where: {
					worldEventId: event.id,
				},
				data: {
					name: null,
				},
			}),
		]
	} else {
		return event.deltaStates.map((state) =>
			dbClient.worldEventDelta.updateMany({
				where: {
					id: state.id,
				},
				data: {
					name: generateEntityNameFromText({
						source: state.description ?? '',
					}),
				},
			})
		)
	}
}
