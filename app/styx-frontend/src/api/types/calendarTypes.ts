import { GetCalendarApiResponse, GetCalendarPreviewApiResponse } from '@api/calendarApi'

export type Calendar = GetCalendarPreviewApiResponse
export type CalendarDraft = GetCalendarApiResponse
export type CalendarDraftUnit = CalendarDraft['units'][number]
export type CalendarDraftUnitChildRelation = CalendarDraftUnit['children'][number]

// export type IngestedCalendar = {
// 	id: string
// 	createdAt: Date
// 	updatedAt: Date
// 	name: string
// 	worldId?: string | null
// 	ownerId?: string | null
// 	units: IngestedCalendarUnit[]
// }

// export type IngestedCalendarUnit = {

// }
