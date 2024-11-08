export type AllowedEvents = 'hideEventInfo' | 'scrollTimelineLeft' | 'scrollTimelineRight'
export type EventParams = {
	['hideEventInfo']: {
		id: string
	}
	['scrollTimelineLeft']: void
	['scrollTimelineRight']: void
}
