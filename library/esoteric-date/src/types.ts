import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'

export type ParsedTimestamp = Map<string, ParsedTimestampEntry>
export type ParsedTimestampEntry = {
	unit: CalendarUnit | CalendarDraftUnit
	value: number
	formatShorthand?: string
	customLabel?: string
}

export type InputParsedTimestamp = Map<string, InputParsedTimestampEntry>
export type InputParsedTimestampEntry = Omit<ParsedTimestampEntry, 'unit'>
