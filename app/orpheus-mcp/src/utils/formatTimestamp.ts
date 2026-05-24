import { EsotericDate } from '@neverkin/esoteric-date'
import { RheaService } from '@src/services/RheaService.js'

export function formatTimestamp(
	timestamp: string | number,
	worldData: Awaited<ReturnType<typeof RheaService.getWorldDetails>>,
) {
	return new EsotericDate(worldData.calendars[0], Number(timestamp)).format()
}
