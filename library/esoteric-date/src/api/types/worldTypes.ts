import { GetResponse } from '@api/utils'

export type WorldCalendar = Omit<GetResponse<'/api/world/{worldId}'>['calendars'][number], 'originTime'> & {
	originTime: number
}
export type WorldCalendarPreview = GetResponse<'/api/calendar/{calendarId}/preview'>
export type WorldCalendarUnit = WorldCalendar['units'][number]
export type WorldCalendarPresentation = WorldCalendar['presentations'][number]
export type WorldCalendarPresentationUnit = WorldCalendar['presentations'][number]['units'][number]
