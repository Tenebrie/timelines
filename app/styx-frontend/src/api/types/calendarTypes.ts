import {
	GetCalendarApiResponse,
	GetCalendarPreviewApiResponse,
	ListCalendarsApiResponse,
} from '@api/calendarApi'
import { ListCalendarUnitFormatModesApiResponse } from '@api/otherApi'

export type Calendar = GetCalendarPreviewApiResponse
export type CalendarUnit = Calendar['units'][number]

export type CalendarDraft = GetCalendarApiResponse
export type CalendarDraftUnit = CalendarDraft['units'][number]
export type CalendarDraftUnitChildRelation = CalendarDraftUnit['children'][number]
export type CalendarDraftPresentation = CalendarDraft['presentations'][number]
export type CalendarDraftPresentationUnit = CalendarDraftPresentation['units'][number]

export type CalendarBrief = ListCalendarsApiResponse[number]
export type CalendarUnitDisplayType = ListCalendarUnitFormatModesApiResponse[number]
