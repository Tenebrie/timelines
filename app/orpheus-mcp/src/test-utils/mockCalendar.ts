/**
 * Minimal single-unit numeric calendar for tool tests.
 *
 * `dateFormat: 'd'` with one numeric "day" unit makes EsotericDate's
 * `format()` / `fromFormatted()` behave as an identity over the raw timestamp,
 * so tests can keep asserting on plain numbers (e.g. "1440") while still
 * exercising the real calendar-aware code paths in the tools.
 *
 * The shape mirrors the `calendars[number]` entry of the `/api/world/{worldId}`
 * response. It is intentionally left untyped so it can be spread into the
 * loosely-typed mock responses passed to `generateEndpointMock`.
 */
export function mockNumericCalendar() {
	return {
		id: 'calendar-1',
		updatedAt: '2024-01-01T00:00:00.000Z',
		name: 'Test Calendar',
		description: '',
		position: 0,
		originTime: '0',
		dateFormat: 'd',
		seasons: [],
		presentations: [],
		units: [
			{
				id: 'day',
				name: 'day',
				position: 0,
				displayName: 'day',
				displayNameShort: 'd',
				displayNamePlural: 'days',
				formatMode: 'Numeric',
				formatShorthand: 'd',
				negativeFormat: 'MinusSign',
				duration: '1',
				treeDepth: 0,
				children: [],
				parents: [],
			},
		],
	}
}
