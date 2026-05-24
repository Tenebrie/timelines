import { EsotericDate } from '@neverkin/esoteric-date'
import { RheaService } from '@src/services/RheaService.js'

type WorldDetails = Awaited<ReturnType<typeof RheaService.getWorldDetails>>
type Calendar = WorldDetails['calendars'][number]
type CalendarUnit = Calendar['units'][number]

export function resolveDateTime<
	T extends string | undefined,
	ReturnValue = T extends string ? number : undefined,
>(dateTime: T, worldData: WorldDetails): ReturnValue {
	if (!dateTime) {
		return undefined as ReturnValue
	}

	try {
		return new EsotericDate(worldData.calendars[0]).fromFormatted(dateTime).getTimestamp() as ReturnValue
	} catch (error) {
		const calendar = worldData.calendars[0]
		const unitDefinitions = formatUnitReminder(calendar, { prefix: '  ' })
		throw new Error(
			`Unable to parse dateTime: ${error}.\n- Expected format: ${worldData.calendars[0].dateFormat}.\n- Example: ${new EsotericDate(calendar).format()}\n- Available units:\n${unitDefinitions}`,
		)
	}
}

export function formatUnitReminder(calendar: Calendar, { prefix }: { prefix?: string } = {}) {
	const unitDefinitions = calendar.units
		.filter(
			(u) =>
				u.formatShorthand &&
				calendar.units.filter((u2) => u2.formatShorthand === u.formatShorthand).indexOf(u) === 0,
		)
		.map((u) => `${prefix ?? ''}${formatSingleUnitReminder(u)}`)
		.join('\n')
	return unitDefinitions
}

function formatSingleUnitReminder(unit: CalendarUnit) {
	const name = unit.displayName ?? unit.name
	const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1)
	return `${unit.formatShorthand}: ${nameCapitalized}`
}
