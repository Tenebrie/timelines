import { WorldCalendar, WorldCalendarPreview } from '@api/types/worldTypes'

export function mockCalendar(overrides: Partial<WorldCalendar>): WorldCalendar {
	return {
		units: [],
		presentations: [],
		id: crypto.randomUUID(),
		updatedAt: '2024-01-01T00:00:00.000Z',
		name: 'Test Calendar',
		description: '',
		position: 0,
		originTime: 0,
		seasons: [],
		...overrides,
	}
}

export const mockCalendarUnit = (
	overrides: Omit<Partial<WorldCalendarPreview['units'][number]>, 'duration'> & {
		id: string
		name: string
		duration: number
	},
): WorldCalendarPreview['units'][number] => ({
	id: overrides.id,
	position: overrides.position ?? 0,
	name: overrides.name,
	displayName: overrides.displayName ?? overrides.name,
	displayNameShort: overrides.displayNameShort ?? overrides.name.substring(0, 1).toUpperCase(),
	displayNamePlural: overrides.displayNamePlural ?? overrides.name + 's',
	formatMode: overrides.formatMode ?? 'Numeric',
	formatShorthand: overrides.formatShorthand ?? null,
	negativeFormat: overrides.negativeFormat ?? 'MinusSign',
	duration: String(overrides.duration ?? 1),
	treeDepth: overrides.treeDepth ?? 0,
	children: overrides.children ?? [],
	parents: overrides.parents ?? [],
})

export const mockCalendarUnitChildRelation = (
	parentUnitId: string,
	childUnitId: string,
	repeats: number,
	overrides: Partial<WorldCalendarPreview['units'][number]['children'][number]> = {},
): WorldCalendarPreview['units'][number]['children'][number] => ({
	id: overrides.id ?? `${parentUnitId}-${childUnitId}`,
	calendarId: overrides.calendarId ?? 'calendar-1111',
	position: overrides.position ?? 0,
	label: overrides.label ?? null,
	repeats,
	parentUnitId,
	childUnitId,
})

export const mockCalendarUnitParentRelation = (
	parentUnitId: string,
	childUnitId: string,
	repeats: number,
	overrides: Partial<WorldCalendarPreview['units'][number]['parents'][number]> = {},
): WorldCalendarPreview['units'][number]['parents'][number] => ({
	id: overrides.id ?? `${parentUnitId}-${childUnitId}`,
	calendarId: overrides.calendarId ?? 'calendar-1111',
	position: overrides.position ?? 0,
	label: overrides.label ?? null,
	repeats,
	parentUnitId,
	childUnitId,
})
