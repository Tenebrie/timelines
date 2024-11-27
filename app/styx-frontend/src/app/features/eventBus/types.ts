import { ClientToCalliopeMessage } from '@/ts-shared/ClientToCalliopeMessage'

export type AllowedEvents =
	| 'hideEventInfo'
	| 'scrollTimelineLeft'
	| 'scrollTimelineRight'
	| 'sendCalliopeMessage'
	| 'calliopeReconnected'
export type EventParams = {
	['hideEventInfo']: {
		id: string
	}
	['scrollTimelineLeft']: void
	['scrollTimelineRight']: void
	['sendCalliopeMessage']: ClientToCalliopeMessage
	['calliopeReconnected']: void
}
