import { GetResponse } from '@api/utils'

export type Calendar = GetResponse<'/api/calendar/{calendarId}/preview'>

export type CalendarUnit = Calendar['units'][number]

export type CalendarDraft = GetResponse<'/api/calendar/{calendarId}'>
export type CalendarDraftUnit = CalendarDraft['units'][number]
export type CalendarDraftUnitChildRelation = CalendarDraftUnit['children'][number]
export type CalendarDraftPresentation = CalendarDraft['presentations'][number]
export type CalendarDraftPresentationUnit = CalendarDraftPresentation['units'][number]

export type CalendarBrief = GetResponse<'/api/calendars'>[number]
export type CalendarUnitDisplayType = GetResponse<'/api/constants/calendar-unit-format-modes'>[number]
